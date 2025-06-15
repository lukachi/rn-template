import type { CircuitType, DocType } from '@modules/e-document'
import { getCircuitDetailsByType, getCircuitType } from '@modules/e-document'
import { NewEDocument } from '@modules/e-document/src/helpers/e-document'
import type { ZKProof } from '@modules/rapidsnark-wrp'
import { groth16ProveWithZKeyFilePath } from '@modules/rapidsnark-wrp'
import {
  buildRegisterCertificateCallData,
  buildRegisterIdentityInputs,
  buildRevoceCalldata,
} from '@modules/rarime-sdk'
import type { AxiosError } from 'axios'
import { Buffer } from 'buffer'
import { encodeBase64, ethers, JsonRpcProvider, keccak256 } from 'ethers'
import type { FieldRecords } from 'mrz'
import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useCallback } from 'react'
import { useState } from 'react'
import { createContext, useContext } from 'react'

import { RARIMO_CHAINS } from '@/api/modules/rarimo'
import { relayerRegister } from '@/api/modules/registration'
import { Config } from '@/config'
import { ErrorHandler } from '@/core'
import { createPoseidonSMTContract, createStateKeeperContract } from '@/helpers'
import { tryCatch } from '@/helpers/try-catch'
import { identityStore, walletStore } from '@/store'
import {
  CertificateAlreadyRegisteredError,
  PassportRegisteredWithAnotherPKError,
} from '@/store/modules/identity/errors'
import { Registration__factory, type StateKeeper } from '@/types'
import type { SparseMerkleTree } from '@/types/contracts/PoseidonSMT'
import { Groth16VerifierHelper, Registration2 } from '@/types/contracts/Registration'

import { useCircuit } from './hooks/circuit'

export enum Steps {
  SelectDocTypeStep,
  ScanMrzStep,
  ScanNfcStep,
  DocumentPreviewStep,
  GenerateProofStep,
  FinishStep,

  RevocationStep,
}

const ZERO_BYTES32_HEX = ethers.encodeBytes32String('')

type PassportInfo = {
  passportInfo_: StateKeeper.PassportInfoStructOutput
  identityInfo_: StateKeeper.IdentityInfoStructOutput
}

type DocumentScanContext = {
  currentStep: Steps

  docType?: DocType
  setDocType: (docType: DocType) => void

  mrz?: FieldRecords
  setMrz: (mrz: FieldRecords) => void

  eDoc?: NewEDocument
  setEDoc: (eDoc: NewEDocument) => void

  regProof?: ZKProof

  createIdentity: () => Promise<void>

  getRevocationChallenge: () => Promise<Uint8Array>

  circuitData?: Omit<ReturnType<typeof useCircuit>, 'loadCircuit'>
}

const documentScanContext = createContext<DocumentScanContext>({
  currentStep: Steps.SelectDocTypeStep,

  setMrz: () => {
    throw new Error('setMrz not implemented')
  },
  setDocType: () => {
    throw new Error('setDocType not implemented')
  },
  setEDoc: () => {
    throw new Error('setEDoc not implemented')
  },

  createIdentity: async () => {
    throw new Error('createIdentity not implemented')
  },

  getRevocationChallenge: async () => {
    throw new Error('getRevocationChallenge not implemented')
  },
})

export function useDocumentScanContext() {
  return useContext(documentScanContext)
}

export let resolveRevocationEDoc: (value: NewEDocument | PromiseLike<NewEDocument>) => void
export let rejectRevocationEDoc: (value: Error) => void

export function ScanContextProvider({
  docType,
  children,
}: {
  docType?: DocType
} & PropsWithChildren) {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)
  const publicKeyHash = walletStore.usePublicKeyHash()

  const addIdentity = identityStore.useIdentityStore(state => state.addIdentity)

  // const [assets] = useAssets([require('@assets/certificates/ICAO.pem')])

  const [currentStep, setCurrentStep] = useState<Steps>(
    docType ? Steps.ScanMrzStep : Steps.SelectDocTypeStep,
  )
  const [selectedDocType, setSelectedDocType] = useState(docType)
  const [mrz, setMrz] = useState<FieldRecords>()
  const [eDocument, setEDocument] = useState<NewEDocument>()
  const [registrationProof, setRegistrationProof] = useState<ZKProof>()

  const { loadCircuit, ...restCircuit } = useCircuit()

  // ----------------------------------------------------------------------------------------

  const rmoEvmJsonRpcProvider = useMemo(() => {
    const evmRpcUrl = RARIMO_CHAINS[Config.RMO_CHAIN_ID].rpcEvm

    return new JsonRpcProvider(evmRpcUrl)
  }, [])

  const certPoseidonSMTContract = useMemo(() => {
    return createPoseidonSMTContract(
      Config.CERT_POSEIDON_SMT_CONTRACT_ADDRESS,
      rmoEvmJsonRpcProvider,
    )
  }, [rmoEvmJsonRpcProvider])

  const stateKeeperContract = useMemo(() => {
    return createStateKeeperContract(Config.STATE_KEEPER_CONTRACT_ADDRESS, rmoEvmJsonRpcProvider)
  }, [rmoEvmJsonRpcProvider])

  // ----------------------------------------------------------------------------------------

  const registerCertificate = useCallback(
    async (slaveCertPem: Uint8Array) => {
      try {
        const callData = await buildRegisterCertificateCallData(
          Config.ICAO_COSMOS_GRPC,
          slaveCertPem,
          Config.MASTER_CERTIFICATES_BUCKETNAME,
          Config.MASTER_CERTIFICATES_FILENAME,
        )

        const { data } = await relayerRegister(
          ethers.hexlify(callData),
          Config.REGISTRATION_CONTRACT_ADDRESS,
        )

        const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

        if (!tx) throw new TypeError('Transaction not found')

        await tx.wait()
      } catch (error) {
        const axiosError = error as AxiosError

        if (JSON.stringify(axiosError.response?.data)?.includes('the key already exists')) {
          throw new CertificateAlreadyRegisteredError()
        }

        throw axiosError
      }
    },
    [rmoEvmJsonRpcProvider],
  )

  const getPassportInfo = useCallback(
    async (eDoc: NewEDocument, regProof: ZKProof) => {
      try {
        const passportInfoKeyBigIntString = eDoc.dg15Bytes?.length
          ? regProof.pub_signals[0]
          : regProof.pub_signals[1]

        const passportInfoKeyBytes = ethers.zeroPadValue(
          '0x' + ethers.getBigInt(passportInfoKeyBigIntString).toString(16),
          32,
        )

        return await stateKeeperContract.contractInstance.getPassportInfo(passportInfoKeyBytes)
      } catch (error) {
        console.error('getPassportInfo', error)
        return null
      }
    },
    [stateKeeperContract.contractInstance],
  )

  const getIdentityRegProof = useCallback(
    async (
      eDoc: NewEDocument,
      circuitType: CircuitType,
      publicKeyPem: Uint8Array,
      smtProof: SparseMerkleTree.ProofStructOutput,
    ) => {
      const circuitsLoadingResult = await loadCircuit(circuitType)

      if (!circuitsLoadingResult) throw new TypeError('Circuit loading failed')

      const encapsulatedContent = eDoc.sod.encapsulatedContent
      const signedAttributes = eDoc.sod.signedAttributes
      const sodSignature = eDoc.sod.signature

      const registerIdentityInputs = await buildRegisterIdentityInputs({
        privateKeyHex: privateKey,
        encapsulatedContent,
        signedAttributes,
        sodSignature,
        dg1: eDoc.dg1Bytes,
        dg15: eDoc.dg15Bytes || new Uint8Array(),
        pubKeyPem: publicKeyPem,
        smtProofJson: Buffer.from(
          JSON.stringify({
            root: encodeBase64(smtProof.root),
            siblings: smtProof.siblings.map(el => encodeBase64(el)),
            existence: smtProof.existence,
          }),
        ),
      })

      const registerIdentityInputsJson = Buffer.from(registerIdentityInputs).toString()

      const { wtnsCalcMethod: registerIdentityWtnsCalc } = getCircuitDetailsByType(circuitType)

      const wtns = await registerIdentityWtnsCalc(
        circuitsLoadingResult.dat,
        Buffer.from(registerIdentityInputsJson),
      )

      const registerIdentityZkProofBytes = await groth16ProveWithZKeyFilePath(
        wtns,
        circuitsLoadingResult.zKeyUri.replace('file://', ''),
      )

      return JSON.parse(Buffer.from(registerIdentityZkProofBytes).toString()) as ZKProof
    },
    [loadCircuit, privateKey],
  )

  const newBuildRegisterCallData = useCallback(
    (
      regProof: ZKProof,
      eDoc: NewEDocument,
      masterCertSmtProofRoot: Uint8Array,
      circuitTypeCertificatePubKeySize: number, // ecSizeInBits
      isRevoked: boolean,
      circuitName: string,
    ) => {
      const passportKey = regProof.pub_signals[0]
      const passportHash = regProof.pub_signals[1]
      const dg1Commitment = regProof.pub_signals[2]
      const pkIdentityHash = regProof.pub_signals[3]

      if (!eDoc.AASignature) throw new TypeError('AA signature not found')

      if (!eDoc.AAPublicKey) throw new TypeError('AA public key not found')

      const parts = circuitName.split('_')

      if (parts.length < 2) {
        throw new Error('circuit name is in invalid format')
      }

      // ZKTypePrefix represerts the circuit zk type prefix
      const ZKTypePrefix = 'Z_PER_PASSPORT'

      const zkTypeSuffix = parts.slice(1).join('_') // support for multi-underscore suffix
      const zkTypeName = `${ZKTypePrefix}_${zkTypeSuffix}`

      const passport: Registration2.PassportStruct = {
        dataType: eDoc.getAADataType(circuitTypeCertificatePubKeySize),
        zkType: keccak256(zkTypeName),
        signature: eDoc.AASignature,
        publicKey: eDoc.AAPublicKey === null ? passportKey : eDoc.AAPublicKey,
        passportHash,
      }

      const proofPoints: Groth16VerifierHelper.ProofPointsStruct = {
        a: [BigInt(regProof.proof.pi_a[0]), BigInt(regProof.proof.pi_a[1])],
        b: [
          [BigInt(regProof.proof.pi_b[0][0]), BigInt(regProof.proof.pi_b[0][1])],
          [BigInt(regProof.proof.pi_b[1][0]), BigInt(regProof.proof.pi_b[1][1])],
        ],
        c: [BigInt(regProof.proof.pi_c[0]), BigInt(regProof.proof.pi_c[1])],
      }

      const registrationContractInterface = Registration__factory.createInterface()

      if (isRevoked) {
        return registrationContractInterface.encodeFunctionData('reissueIdentity', [
          masterCertSmtProofRoot,
          pkIdentityHash,
          dg1Commitment,
          passport,
          proofPoints,
        ])
      }

      return registrationContractInterface.encodeFunctionData('register', [
        masterCertSmtProofRoot,
        pkIdentityHash,
        dg1Commitment,
        passport,
        proofPoints,
      ])
    },
    [],
  )

  const requestRelayerRegisterMethod = useCallback(
    async (
      regProof: ZKProof,
      eDoc: NewEDocument,
      masterCertSmtProofRoot: Uint8Array,
      circuitTypeCertificatePubKeySize: number,
      isRevoked: boolean,
    ) => {
      const registerCallData = newBuildRegisterCallData(
        regProof,
        eDoc,
        masterCertSmtProofRoot,
        circuitTypeCertificatePubKeySize,
        isRevoked,
        0, // TODO circuitName has to be built
      )

      const { data } = await relayerRegister(registerCallData, Config.REGISTRATION_CONTRACT_ADDRESS)

      const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

      if (!tx) throw new TypeError('Transaction not found')

      await tx.wait()
    },
    [newBuildRegisterCallData, rmoEvmJsonRpcProvider],
  )

  const registerIdentity = useCallback(
    async (
      regProof: ZKProof,
      eDoc: NewEDocument,
      smtProof: SparseMerkleTree.ProofStructOutput,
      circuitType: CircuitType,
      passportInfo: PassportInfo | null,
    ): Promise<void> => {
      const currentIdentityKey = publicKeyHash
      const currentIdentityKeyHex = ethers.hexlify(currentIdentityKey)

      const isPassportNotRegistered =
        !passportInfo || passportInfo.passportInfo_.activeIdentity === ZERO_BYTES32_HEX

      const { circuitTypeCertificatePubKeySize } = getCircuitDetailsByType(circuitType)

      if (isPassportNotRegistered) {
        await requestRelayerRegisterMethod(
          regProof,
          eDoc,
          Buffer.from(smtProof.root),
          circuitTypeCertificatePubKeySize,
          false,
        )
      }

      const isPassportRegisteredWithCurrentPK =
        passportInfo?.passportInfo_.activeIdentity === currentIdentityKeyHex

      if (isPassportRegisteredWithCurrentPK) {
        // TODO: save eDoc, regProof, and proceed complete
      }

      throw new PassportRegisteredWithAnotherPKError()
    },
    [publicKeyHash, requestRelayerRegisterMethod],
  )

  const getRevocationChallenge = useCallback(async (): Promise<Uint8Array> => {
    if (!eDocument) throw new TypeError('eDocument not found')

    if (!registrationProof) throw new TypeError('Registration proof not found')

    const passportInfo = await getPassportInfo(eDocument, registrationProof)

    if (!passportInfo?.passportInfo_.activeIdentity)
      throw new TypeError('Active identity not found')

    const challenge = ethers.getBytes(passportInfo.passportInfo_.activeIdentity).slice(24, 32)

    return challenge
  }, [eDocument, getPassportInfo, registrationProof])

  // ---------------------------------------------------------------------------------------------

  const revokeIdentity = useCallback(
    async (
      originalEDoc: NewEDocument,
      passportInfo: PassportInfo | null,
      slaveCertSmtProof: SparseMerkleTree.ProofStructOutput,
      circuitType: CircuitType,
      regProof: ZKProof,
    ) => {
      setCurrentStep(Steps.RevocationStep)

      const revokeEDoc = await new Promise<NewEDocument>((resolve, reject) => {
        resolveRevocationEDoc = resolve
        rejectRevocationEDoc = reject
      })

      if (!passportInfo?.passportInfo_.activeIdentity)
        throw new TypeError('Active identity not found')

      const activeIdentityBytes = ethers.getBytes(passportInfo?.passportInfo_.activeIdentity)

      const isPassportRegistered = passportInfo?.passportInfo_.activeIdentity !== ZERO_BYTES32_HEX

      if (isPassportRegistered) {
        const calldata = await buildRevoceCalldata(
          activeIdentityBytes,
          revokeEDoc.aaSignature,
          revokeEDoc.dg15PubKeyPem || new Uint8Array(),
        )

        try {
          const { data } = await relayerRegister(
            ethers.hexlify(calldata),
            Config.REGISTRATION_CONTRACT_ADDRESS,
          )

          const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

          if (!tx) throw new TypeError('Transaction not found')

          await tx.wait()
        } catch (error) {
          const axiosError = error as AxiosError
          if (axiosError.response?.data) {
            console.warn(JSON.stringify(axiosError.response?.data))
          }

          const errorMsgsToSkip = ['the leaf does not match', 'already revoked']

          const isSkip = errorMsgsToSkip.some(q =>
            JSON.stringify(axiosError.response?.data)?.includes(q),
          )

          if (!isSkip) {
            throw axiosError
          }
        }
      }

      const { circuitTypeCertificatePubKeySize } = getCircuitDetailsByType(circuitType)

      await requestRelayerRegisterMethod(
        regProof,
        originalEDoc,
        ethers.getBytes(slaveCertSmtProof.root),
        circuitTypeCertificatePubKeySize,
        true,
      )
    },
    [requestRelayerRegisterMethod, rmoEvmJsonRpcProvider],
  )

  const createIdentity = useCallback(async (): Promise<void> => {
    if (!eDocument) return

    setCurrentStep(Steps.GenerateProofStep)

    // const icaoAsset = assets?.[0]

    // TODO: check slave cert pem against icao bytes
    // if (!icaoAsset?.localUri) throw new TypeError('ICAO asset not found')
    // const icaoBase64 = await FileSystem.readAsStringAsync(icaoAsset.localUri, {
    //   encoding: FileSystem.EncodingType.Base64,
    // })
    // const icaoBytes = ethers.decodeBase64(icaoBase64)

    const [slaveCertIdx, getSlaveCertIdxError] = await tryCatch(
      eDocument.sod.getSlaveCertificateIndex(eDocument.sod.slaveCertPemBytes),
    )
    if (getSlaveCertIdxError) {
      ErrorHandler.processWithoutFeedback(getSlaveCertIdxError)
      setCurrentStep(Steps.DocumentPreviewStep)
      return
    }

    const circuitType = getCircuitType(eDocument.sod.X509RSASize)

    if (!circuitType) throw new TypeError('Unsupported public key size')

    const [slaveCertSmtProof, getSlaveCertSmtProof] = await tryCatch(
      certPoseidonSMTContract.contractInstance.getProof(ethers.zeroPadValue(slaveCertIdx, 32)),
    )
    if (getSlaveCertSmtProof) {
      ErrorHandler.processWithoutFeedback(getSlaveCertSmtProof)
      setCurrentStep(Steps.DocumentPreviewStep)
      return
    }

    if (!slaveCertSmtProof.existence) {
      const [, registerCertificateError] = await tryCatch(
        registerCertificate(eDocument.sod.slaveCertPemBytes),
      )
      if (registerCertificateError) {
        ErrorHandler.processWithoutFeedback(registerCertificateError)

        if (!(registerCertificateError instanceof CertificateAlreadyRegisteredError)) {
          setCurrentStep(Steps.DocumentPreviewStep)
          return
        }
      }
    }

    const [regProof, getRegProofError] = await tryCatch(
      getIdentityRegProof(
        eDocument,
        circuitType,
        eDocument.sod.publicKeyPemBytes,
        slaveCertSmtProof,
      ),
    )
    if (getRegProofError) {
      ErrorHandler.processWithoutFeedback(getRegProofError)
      setCurrentStep(Steps.DocumentPreviewStep)
      return
    }
    setRegistrationProof(regProof)

    const [passportInfo, getPassportInfoError] = await tryCatch(
      getPassportInfo(eDocument, regProof),
    )
    if (getPassportInfoError) {
      ErrorHandler.processWithoutFeedback(getPassportInfoError)
      setCurrentStep(Steps.DocumentPreviewStep)
      return
    }

    const [, registerIdentityError] = await tryCatch(
      registerIdentity(regProof, eDocument, slaveCertSmtProof, circuitType, passportInfo),
    )
    if (registerIdentityError) {
      const [, revokeIdentityError] = await tryCatch(
        revokeIdentity(eDocument, passportInfo, slaveCertSmtProof, circuitType, regProof),
      )
      if (revokeIdentityError) {
        ErrorHandler.processWithoutFeedback(revokeIdentityError)
        setCurrentStep(Steps.DocumentPreviewStep)
        return
      }
    }

    addIdentity({
      document: eDocument,
      registrationProof: regProof,
    })

    setCurrentStep(Steps.FinishStep)
  }, [
    addIdentity,
    certPoseidonSMTContract.contractInstance,
    eDocument,
    getIdentityRegProof,
    getPassportInfo,
    registerCertificate,
    registerIdentity,
    revokeIdentity,
  ])

  // ---------------------------------------------------------------------------------------------

  const handleSetSelectedDocType = useCallback((value: DocType) => {
    setSelectedDocType(value)
    setCurrentStep(Steps.ScanMrzStep)
  }, [])

  const setTestEDoc = identityStore.useIdentityStore(state => state.setTestEDoc)
  const setTestMRZ = identityStore.useIdentityStore(state => state.setTestMRZ)

  const handleSetMrz = useCallback(
    (value: FieldRecords) => {
      setMrz(value)
      setTestMRZ(value) // TODO: remove me
      setCurrentStep(Steps.ScanNfcStep)
    },
    [setTestMRZ],
  )

  const handleSetEDoc = useCallback(
    (value: NewEDocument) => {
      setEDocument(value)
      setTestEDoc(value) // TODO: remove me
      setCurrentStep(Steps.DocumentPreviewStep)
    },
    [setTestEDoc],
  )

  const testEDoc = identityStore.useIdentityStore(state => state.testEDoc) // TODO: remove me
  const testMRZ = identityStore.useIdentityStore(state => state.testMRZ) // TODO: remove me

  // TODO: remove me
  const initted = useRef(false)
  useEffect(() => {
    if (initted.current || currentStep === Steps.DocumentPreviewStep) return

    initted.current = true

    if (testEDoc && testMRZ) {
      setEDocument(testEDoc)
      setMrz(testMRZ)
      setCurrentStep(Steps.DocumentPreviewStep)
    }
  }, [currentStep, testEDoc, testMRZ])

  return (
    <documentScanContext.Provider
      value={{
        currentStep,

        docType: selectedDocType,
        setDocType: handleSetSelectedDocType,

        mrz,
        setMrz: handleSetMrz,

        eDoc: eDocument,
        setEDoc: handleSetEDoc,

        regProof: registrationProof,

        createIdentity,

        getRevocationChallenge,

        circuitData: restCircuit,
      }}
      children={children}
    />
  )
}
