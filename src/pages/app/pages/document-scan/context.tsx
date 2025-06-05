import type { CircuitType, DocType, EDocument } from '@modules/e-document'
import { getCircuitDetailsByType } from '@modules/e-document'
import { getDG15PubKeyPem } from '@modules/e-document'
import { getCircuitType } from '@modules/e-document'
import {
  getSodEncapsulatedContent,
  getSodSignature,
  getSodSignedAttributes,
} from '@modules/e-document'
import type { ZKProof } from '@modules/rapidsnark-wrp'
import { groth16ProveWithZKeyFilePath } from '@modules/rapidsnark-wrp'
import {
  buildRegisterCallData,
  buildRegisterCertificateCallData,
  buildRegisterIdentityInputs,
  buildRevoceCalldata,
  getPublicKeyHash,
} from '@modules/rarime-sdk'
import type { AxiosError } from 'axios'
import { Buffer } from 'buffer'
import { encodeBase64, ethers, JsonRpcProvider } from 'ethers'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import type { FieldRecords } from 'mrz'
import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useCallback } from 'react'
import { useState } from 'react'
import { createContext, useContext } from 'react'
import { Text, View } from 'react-native'

import { RARIMO_CHAINS } from '@/api/modules/rarimo'
import { relayerRegister } from '@/api/modules/registration'
import { Config } from '@/config'
import { bus, DefaultBusEvents } from '@/core'
import { createPoseidonSMTContract, createStateKeeperContract } from '@/helpers'
import { Sod } from '@/helpers/sod'
import { identityStore, walletStore } from '@/store'
import {
  CertificateAlreadyRegisteredError,
  PassportRegisteredWithAnotherPKError,
} from '@/store/modules/identity/errors'
import type { StateKeeper } from '@/types'
import type { SparseMerkleTree } from '@/types/contracts/PoseidonSMT'

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

  eDoc?: EDocument
  setEDoc: (eDoc: EDocument) => void

  regProof?: ZKProof

  createIdentity: () => Promise<void>
  identityCreationProcess: JSX.Element

  getRevocationChallenge: () => Promise<Uint8Array>
}

const documentScanContext = createContext<DocumentScanContext>({
  currentStep: Steps.SelectDocTypeStep,

  setMrz: () => {},
  setDocType: () => {},
  setEDoc: () => {},

  createIdentity: async () => {},
  identityCreationProcess: <></>,

  getRevocationChallenge: async () => new Uint8Array(),
})

export function useDocumentScanContext() {
  return useContext(documentScanContext)
}

type Props = {
  docType?: DocType
} & PropsWithChildren

export let resolveRevocationEDoc: (value: EDocument | PromiseLike<EDocument>) => void
export let rejectRevocationEDoc: (value: Error) => void

export function ScanContextProvider({ docType, children }: Props) {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)

  const addIdentity = identityStore.useIdentityStore(state => state.addIdentity)

  const [assets] = useAssets([require('@assets/certificates/ICAO.pem')])

  const [currentStep, setCurrentStep] = useState<Steps>(
    docType ? Steps.ScanMrzStep : Steps.SelectDocTypeStep,
  )
  const [selectedDocType, setSelectedDocType] = useState(docType)
  const [mrz, setMrz] = useState<FieldRecords>()
  const [eDocument, setEDocument] = useState<EDocument>()
  const [registrationProof, setRegistrationProof] = useState<ZKProof>()

  /* TEMP. sharable files */
  // const [slaveCertSmtProof, setSlaveCertSmtProof] = useState<SparseMerkleTree.ProofStructOutput>()
  // const [passportInfo, setPassportInfo] = useState<PassportInfo | null>(null)
  // const [circuitType, setCircuitType] = useState<CircuitType>()

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
    async (eDoc: EDocument, regProof: ZKProof): Promise<PassportInfo | null> => {
      try {
        const passportInfoKeyBigIntString = eDoc.dg15?.length
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
      eDoc: EDocument,
      circuitType: CircuitType,
      publicKeyPem: Uint8Array,
      smtProof: SparseMerkleTree.ProofStructOutput,
    ) => {
      const circuitsLoadingResult = await loadCircuit(circuitType)

      if (!circuitsLoadingResult) throw new TypeError('Circuit loading failed')

      if (!eDoc.sod) throw new TypeError('SOD not found')

      const sodBytes = ethers.decodeBase64(eDoc.sod)

      const encapsulatedContent = await getSodEncapsulatedContent(sodBytes)
      const signedAttributes = await getSodSignedAttributes(sodBytes)
      const sodSignature = await getSodSignature(sodBytes)

      if (!eDoc.dg1) throw new TypeError('DG1 not found')

      if (!eDoc.dg15) throw new TypeError('DG15 not found')

      const dg1Bytes = ethers.decodeBase64(eDoc.dg1)
      const dg15Bytes = ethers.decodeBase64(eDoc.dg15)

      const registerIdentityInputs = await buildRegisterIdentityInputs({
        privateKeyHex: privateKey,
        encapsulatedContent,
        signedAttributes,
        sodSignature,
        dg1: dg1Bytes,
        dg15: dg15Bytes,
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

  const requestRelayerRegisterMethod = useCallback(
    async (
      regProof: ZKProof,
      eDoc: EDocument,
      masterCertSmtProofRoot: Uint8Array,
      circuitTypeCertificatePubKeySize: number,
      isRevoked: boolean,
    ) => {
      if (!eDoc.dg15) throw new TypeError('DG15 not found')

      if (!eDoc.signature) throw new TypeError('Signature not found')

      const dg15PubKeyPem = await getDG15PubKeyPem(ethers.decodeBase64(eDoc.dg15))

      const registerCallData = await buildRegisterCallData(
        Buffer.from(JSON.stringify(regProof)),
        ethers.decodeBase64(eDoc.signature),
        dg15PubKeyPem,
        masterCertSmtProofRoot,
        circuitTypeCertificatePubKeySize,
        isRevoked,
      )

      const { data } = await relayerRegister(
        ethers.hexlify(registerCallData),
        Config.REGISTRATION_CONTRACT_ADDRESS,
      )

      const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

      if (!tx) throw new TypeError('Transaction not found')

      await tx.wait()
    },
    [rmoEvmJsonRpcProvider],
  )

  const registerIdentity = useCallback(
    async (
      regProof: ZKProof,
      eDoc: EDocument,
      smtProof: SparseMerkleTree.ProofStructOutput,
      circuitType: CircuitType,
      passportInfo: PassportInfo | null,
    ): Promise<void> => {
      const currentIdentityKey = await getPublicKeyHash(privateKey)
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
    [privateKey, requestRelayerRegisterMethod],
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
      originalEDoc: EDocument,
      passportInfo: PassportInfo | null,
      slaveCertSmtProof: SparseMerkleTree.ProofStructOutput,
      circuitType: CircuitType,
      regProof: ZKProof,
    ) => {
      setCurrentStep(Steps.RevocationStep)

      const revokeEDoc = await new Promise<EDocument>((resolve, reject) => {
        resolveRevocationEDoc = resolve
        rejectRevocationEDoc = reject
      })

      if (!revokeEDoc.dg15) throw new TypeError('DG15 not found')

      if (!revokeEDoc.signature) throw new TypeError('Signature not found')

      if (!passportInfo?.passportInfo_.activeIdentity)
        throw new TypeError('Active identity not found')

      if (!slaveCertSmtProof) throw new TypeError('Slave certificate SMT proof not found')

      if (!circuitType) throw new TypeError('Circuit type not found')

      const revokeEDocEDocSignature = ethers.decodeBase64(revokeEDoc.signature)

      const dg15PubKeyPem = await getDG15PubKeyPem(ethers.decodeBase64(revokeEDoc.dg15))

      const activeIdentityBytes = ethers.getBytes(passportInfo?.passportInfo_.activeIdentity)

      const isPassportRegistered = passportInfo?.passportInfo_.activeIdentity !== ZERO_BYTES32_HEX

      if (isPassportRegistered) {
        const calldata = await buildRevoceCalldata(
          activeIdentityBytes,
          revokeEDocEDocSignature,
          dg15PubKeyPem,
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

    try {
      setCurrentStep(Steps.GenerateProofStep)

      const icaoAsset = assets?.[0]

      if (!icaoAsset?.localUri) throw new TypeError('ICAO asset not found')

      const icaoBase64 = await FileSystem.readAsStringAsync(icaoAsset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const icaoBytes = ethers.decodeBase64(icaoBase64)

      if (!eDocument.sod) throw new TypeError('SOD not found')

      const sodBytes = ethers.decodeBase64(eDocument.sod)

      const sodInstance = new Sod(sodBytes)
      const publicKeyPem = sodInstance.publicKeyPemBytes
      const pubKeySize = sodInstance.X509RSASize
      const slaveCertPem = sodInstance.slaveCertPemBytes
      const slaveCertIdx = await sodInstance.getSlaveCertificateIndex(slaveCertPem, icaoBytes)

      const circuitType = getCircuitType(pubKeySize)

      const encapsulatedContent = sodInstance.encapsulatedContent

      const signedAttributes = await getSodSignedAttributes(sodBytes)

      console.log({
        signedAttributes,
        signedAttributesBase64: ethers.encodeBase64(signedAttributes),
        newSignedAttributes: sodInstance.signedAttributes,
        newSignedAttributesBase64: ethers.encodeBase64(sodInstance.signedAttributes),
      })
      const sodSignature = await getSodSignature(sodBytes)

      try {
        console.log({ sodSignature, base64: ethers.encodeBase64(sodSignature) })
        console.log({
          newSodSignature: sodInstance.signature,
          base64: ethers.encodeBase64(sodInstance.signature),
        })
      } catch (error) {
        console.error('Error while getting SOD signature:', error)
      }

      throw new TypeError('Purpose error')

      if (!circuitType) throw new TypeError('Unsupported public key size')

      const slaveCertSmtProof = await certPoseidonSMTContract.contractInstance.getProof(
        ethers.zeroPadValue(slaveCertIdx, 32),
      )

      if (!slaveCertSmtProof.existence) {
        try {
          await registerCertificate(slaveCertPem)
        } catch (error) {
          console.error(error)
          if (!(error instanceof CertificateAlreadyRegisteredError)) {
            throw error
          }
        }
      }

      const regProof = await getIdentityRegProof(
        eDocument,
        circuitType,
        publicKeyPem,
        slaveCertSmtProof,
      )
      setRegistrationProof(regProof)

      const passportInfo = await getPassportInfo(eDocument, regProof)

      try {
        await registerIdentity(regProof, eDocument, slaveCertSmtProof, circuitType, passportInfo)
      } catch (error) {
        if (error instanceof PassportRegisteredWithAnotherPKError) {
          await revokeIdentity(eDocument, passportInfo, slaveCertSmtProof, circuitType, regProof)
        } else {
          throw error
        }
      }

      addIdentity({
        document: eDocument,
        registrationProof: regProof,
      })
      setCurrentStep(Steps.FinishStep)
    } catch (error) {
      const axiosError = error as AxiosError

      if (axiosError.response?.data) {
        console.warn(JSON.stringify(axiosError.response?.data))
      }

      console.error(error)

      bus.emit(DefaultBusEvents.error, {
        message: 'Failed to register identity',
      })
      setCurrentStep(Steps.DocumentPreviewStep)
    }
  }, [
    addIdentity,
    assets,
    certPoseidonSMTContract.contractInstance,
    eDocument,
    getIdentityRegProof,
    getPassportInfo,
    registerCertificate,
    registerIdentity,
    revokeIdentity,
  ])

  // ---------------------------------------------------------------------------------------------

  const identityCreationProcess = useMemo(() => {
    return (
      <View>
        <Text className='text-textPrimary typography-subtitle4'>Downloading Progress:</Text>
        <Text className='text-textPrimary typography-body3'>{restCircuit.downloadingProgress}</Text>

        <Text className='text-textPrimary typography-subtitle4'>isLoaded:</Text>
        <Text className='text-textPrimary typography-body3'>{String(restCircuit.isLoaded)}</Text>

        <Text className='text-textPrimary typography-subtitle4'>isCircuitsLoadFailed:</Text>
        <Text className='text-textPrimary typography-body3'>
          {String(restCircuit.isLoadFailed)}
        </Text>
      </View>
    )
  }, [restCircuit.downloadingProgress, restCircuit.isLoadFailed, restCircuit.isLoaded])

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
    (value: EDocument) => {
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
        identityCreationProcess,

        getRevocationChallenge,
      }}
      children={children}
    />
  )
}
