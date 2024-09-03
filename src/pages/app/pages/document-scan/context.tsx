import type { CircuitType, DocType, EDocument } from '@modules/e-document'
import { getCircuitDetailsByType } from '@modules/e-document'
import { getDG15PubKeyPem } from '@modules/e-document'
import { getCircuitType, getPublicKeyPem, getSlaveCertificatePem } from '@modules/e-document'
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
  getSlaveCertIndex,
  getX509RSASize,
} from '@modules/rarime-sdk'
import type { AxiosError } from 'axios'
import { Buffer } from 'buffer'
import { encodeBase64, ethers, JsonRpcProvider } from 'ethers'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import type { FieldRecords } from 'mrz'
import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { useCallback } from 'react'
import { useState } from 'react'
import { createContext, useContext } from 'react'
import { Text, View } from 'react-native'
import { unzip } from 'react-native-zip-archive'

import { RARIMO_CHAINS } from '@/api/modules/rarimo'
import { relayerRegister } from '@/api/modules/registration'
import { Config } from '@/config'
import { bus, DefaultBusEvents } from '@/core'
import { createPoseidonSMTContract, createStateKeeperContract } from '@/helpers'
import { walletStore } from '@/store'
import {
  CertificateAlreadyRegisteredError,
  PassportRegisteredWithAnotherPKError,
} from '@/store/modules/identity/errors'
import type { StateKeeper } from '@/types'
import type { SparseMerkleTree } from '@/types/contracts/PoseidonSMT'

export enum Steps {
  SelectDocTypeStep,
  ScanMrzStep,
  ScanNfcStep,
  DocumentPreviewStep,
  GenerateProofStep,

  RevocationStep,
}

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

  createIdentity: () => Promise<void>
  identityCreationProcess: JSX.Element

  getRevocationChallenge: () => Promise<Uint8Array>
  revokeIdentity: (eDoc: EDocument) => Promise<void>
}

const useCircuit = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadFailed, setIsLoadFailed] = useState(false)
  const [downloadingProgress, setDownloadingProgress] = useState('')

  const checkCircuitsLoaded = useCallback(async (zkeyPath: string, datPath: string) => {
    const zkeyInfo = await FileSystem.getInfoAsync(zkeyPath)
    const datInfo = await FileSystem.getInfoAsync(datPath)

    return zkeyInfo.exists && datInfo.exists
  }, [])

  const loadCircuit = useCallback(
    async (
      circuitType: CircuitType,
    ): Promise<{
      zKeyUri: string
      dat: Uint8Array
    }> => {
      setDownloadingProgress('')
      setIsLoaded(false)
      setIsLoadFailed(false)

      try {
        const { circuitDownloadUrl } = getCircuitDetailsByType(circuitType)

        const fileUri = `${FileSystem.documentDirectory}${circuitType}.zip`
        const targetPath = `${FileSystem.documentDirectory}${circuitType}`

        const circuitDirSubpath = `${circuitType}-download`
        const zkeyPath = `${targetPath}/${circuitDirSubpath}/circuit_final.zkey`
        const datPath = `${targetPath}/${circuitDirSubpath}/${circuitType}.dat`

        const isCircuitsLoaded = await checkCircuitsLoaded(zkeyPath, datPath)

        if (isCircuitsLoaded) {
          const dat = await FileSystem.readAsStringAsync(datPath, {
            encoding: FileSystem.EncodingType.Base64,
          })

          setIsLoaded(true)

          return {
            zKeyUri: zkeyPath,
            dat: Buffer.from(dat, 'base64'),
          }
        }

        const downloadResumable = FileSystem.createDownloadResumable(
          circuitDownloadUrl,
          fileUri,
          {},
          downloadProgress => {
            setDownloadingProgress(
              `${downloadProgress.totalBytesWritten} / ${downloadProgress.totalBytesExpectedToWrite}`,
            )
          },
        )

        const downloadResult = await downloadResumable.downloadAsync()

        if (!downloadResult) {
          throw new TypeError('Download failed: downloadResult is undefined')
        }

        console.log('Finished downloading to ', downloadResult.uri)

        await unzip(downloadResult.uri, targetPath)
        console.log('Unzipped to ', targetPath)

        const dat = await FileSystem.readAsStringAsync(datPath, {
          encoding: FileSystem.EncodingType.Base64,
        })

        setIsLoaded(true)

        return {
          zKeyUri: zkeyPath,
          dat: Buffer.from(dat, 'base64'),
        }
      } catch (error) {
        console.error('Error in loadCircuit: ', error)
        setIsLoadFailed(true)
      }

      setIsLoaded(false)
      throw new TypeError('Circuit loading failed without error')
    },
    [checkCircuitsLoaded],
  )

  return {
    isLoaded,
    isLoadFailed,
    downloadingProgress,
    loadCircuit,
  }
}

const documentScanContext = createContext<DocumentScanContext>({
  currentStep: Steps.SelectDocTypeStep,

  setMrz: () => {},
  setDocType: () => {},
  setEDoc: () => {},

  createIdentity: async () => {},
  identityCreationProcess: <></>,

  getRevocationChallenge: async () => new Uint8Array(),
  revokeIdentity: async () => {},
})

export function useDocumentScanContext() {
  return useContext(documentScanContext)
}

type Props = {
  docType?: DocType
} & PropsWithChildren

export function ScanContextProvider({ docType, children }: Props) {
  const [currentStep, setCurrentStep] = useState<Steps>(
    docType ? Steps.ScanMrzStep : Steps.SelectDocTypeStep,
  )
  const [selectedDocType, setSelectedDocType] = useState(docType)

  const [mrz, setMrz] = useState<FieldRecords>()

  const [eDocument, setEDocument] = useState<EDocument>()

  const [slaveCertSmtProof, setSlaveCertSmtProof] = useState<SparseMerkleTree.ProofStructOutput>()
  const [passportInfo, setPassportInfo] = useState<PassportInfo | null>(null)
  const [circuitType, setCircuitType] = useState<CircuitType>()

  const [registrationProof, setRegistrationProof] = useState<ZKProof>()

  const privateKey = walletStore.useWalletStore(state => state.privateKey)

  const [assets] = useAssets([require('@assets/certificates/ICAO.pem')])

  const { loadCircuit, ...restCircuit } = useCircuit()

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
          '0x' + Buffer.from(callData).toString('hex'),
          Config.REGISTRATION_CONTRACT_ADDRESS,
        )

        const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

        if (!tx) throw new TypeError('Transaction not found')

        await tx.wait()
      } catch (error) {
        const axiosError = error as AxiosError

        if (
          JSON.stringify(get(axiosError, 'response.data.errors', {}))?.includes(
            'the key already exists',
          )
        ) {
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
        const passportInfoKeyBigIntString = isEmpty(eDoc.dg15)
          ? regProof.pub_signals[1]
          : regProof.pub_signals[0]

        const passportInfoKeyBytes = ethers.zeroPadValue(
          '0x' + ethers.getBigInt(passportInfoKeyBigIntString).toString(16),
          32,
        )

        return await stateKeeperContract.contractInstance.getPassportInfo(passportInfoKeyBytes)
      } catch (error) {
        console.log('getPassportInfo', {
          ...error,
        })
        return null
      }
    },
    [stateKeeperContract.contractInstance],
  )

  const getIdentityRegProof = useCallback(
    async (
      eDoc: EDocument,
      _circuitType: CircuitType,
      publicKeyPem: Uint8Array,
      smtProof: SparseMerkleTree.ProofStructOutput,
    ) => {
      const circuitsLoadingResult = await loadCircuit(_circuitType)

      if (!circuitsLoadingResult) throw new TypeError('Circuit loading failed')

      if (!eDoc.sod) throw new TypeError('SOD not found')

      const sodBytes = Buffer.from(eDoc.sod, 'base64')

      const encapsulatedContent = await getSodEncapsulatedContent(sodBytes)
      const signedAttributes = await getSodSignedAttributes(sodBytes)
      const sodSignature = await getSodSignature(sodBytes)

      if (!eDoc.dg1) throw new TypeError('DG1 not found')

      if (!eDoc.dg15) throw new TypeError('DG15 not found')

      const dg1Bytes = Buffer.from(eDoc.dg1, 'base64')
      const dg15Bytes = Buffer.from(eDoc.dg15, 'base64')

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

      const { wtnsCalcMethod: registerIdentityWtnsCalc } = getCircuitDetailsByType(_circuitType)

      const wtns = await registerIdentityWtnsCalc(
        circuitsLoadingResult.dat,
        Buffer.from(registerIdentityInputsJson),
      )

      if (wtns?.length) {
        console.log('wtns', wtns.length)
      }

      const registerIdentityZkProofBytes = await groth16ProveWithZKeyFilePath(
        wtns,
        circuitsLoadingResult.zKeyUri.replace('file://', ''),
      )

      return JSON.parse(Buffer.from(registerIdentityZkProofBytes).toString()) as ZKProof
    },
    [loadCircuit, privateKey],
  )

  const registerViaRelayer = useCallback(
    async (
      regProof: ZKProof,
      eDoc: EDocument,
      masterCertSmtProofRoot: Uint8Array,
      circuitTypeCertificatePubKeySize: number,
      isRevoked: boolean,
    ) => {
      if (!eDoc.sod) throw new TypeError('SOD not found')

      if (!eDoc.dg15) throw new TypeError('DG15 not found')

      if (!eDoc.signature) throw new TypeError('Signature not found')

      const dg15PubKeyPem = await getDG15PubKeyPem(Buffer.from(eDoc.dg15, 'base64'))

      console.log('registerCallData')
      const registerCallData = await buildRegisterCallData(
        Buffer.from(JSON.stringify(regProof)),
        Buffer.from(eDoc.signature, 'base64'),
        dg15PubKeyPem,
        masterCertSmtProofRoot,
        circuitTypeCertificatePubKeySize,
        isRevoked,
      )
      console.log(registerCallData)

      console.log('relayerRegister')
      const { data } = await relayerRegister(
        '0x' + Buffer.from(registerCallData).toString('hex'),
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
      _circuitType: CircuitType,
      _passportInfo: PassportInfo | null,
    ): Promise<void> => {
      const currentIdentityKey = await getPublicKeyHash(privateKey)
      const currentIdentityKeyHex = '0x' + Buffer.from(currentIdentityKey).toString('hex')

      const ZERO_BYTES32 = ethers.encodeBytes32String('')

      const isPassportNotRegistered =
        !_passportInfo || _passportInfo.passportInfo_.activeIdentity === ZERO_BYTES32

      const { circuitTypeCertificatePubKeySize } = getCircuitDetailsByType(_circuitType)

      if (isPassportNotRegistered) {
        await registerViaRelayer(
          regProof,
          eDoc,
          Buffer.from(smtProof.root),
          circuitTypeCertificatePubKeySize,
          false,
        )
      }

      const isPassportRegisteredWithCurrentPK =
        _passportInfo?.passportInfo_.activeIdentity === currentIdentityKeyHex

      if (isPassportRegisteredWithCurrentPK) {
        // TODO: save eDoc, regProof, and proceed complete
        console.log('isPassportRegisteredWithCurrentPK')
      }

      throw new PassportRegisteredWithAnotherPKError()
    },
    [privateKey, registerViaRelayer],
  )

  const getRevocationChallenge = useCallback(async (): Promise<Uint8Array> => {
    const isPassportRegistered =
      passportInfo?.passportInfo_.activeIdentity !== ethers.encodeBytes32String('')

    if (!isPassportRegistered || !passportInfo?.passportInfo_.activeIdentity)
      throw new TypeError('Passport is not registered')

    return ethers.getBytes(passportInfo.passportInfo_.activeIdentity).slice(24, 32)
  }, [passportInfo?.passportInfo_.activeIdentity])

  // ---------------------------------------------------------------------------------------------

  const revokeIdentity = useCallback(
    async (eDoc: EDocument) => {
      setEDocument(eDoc)

      if (!eDoc.dg15) throw new TypeError('DG15 not found')

      if (!eDoc.signature) throw new TypeError('Signature not found')

      if (!passportInfo?.passportInfo_.activeIdentity)
        throw new TypeError('Active identity not found')

      if (!registrationProof) throw new TypeError('Registration proof not found')

      if (!slaveCertSmtProof) throw new TypeError('Slave certificate SMT proof not found')

      if (!circuitType) throw new TypeError('Circuit type not found')

      const eDocSignature = Buffer.from(eDoc.signature, 'base64')

      const dg15PubKeyPem = await getDG15PubKeyPem(Buffer.from(eDoc.dg15, 'base64'))

      const activeIdentity = ethers.getBytes(passportInfo?.passportInfo_.activeIdentity)

      const calldata = await buildRevoceCalldata(activeIdentity, eDocSignature, dg15PubKeyPem)

      try {
        const { data } = await relayerRegister(
          '0x' + Buffer.from(calldata).toString('hex'),
          Config.REGISTRATION_CONTRACT_ADDRESS,
        )

        const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

        if (!tx) throw new TypeError('Transaction not found')

        await tx.wait()
      } catch (error) {
        console.log({ ...error })
        const axiosError = error as AxiosError
        console.log(JSON.stringify(get(axiosError, 'response.data.errors', {})))

        if (
          !JSON.stringify(get(axiosError, 'response.data.errors', {}))?.includes('already revoked')
        ) {
          throw error
        }
      }

      try {
        const { circuitTypeCertificatePubKeySize } = getCircuitDetailsByType(circuitType)

        await registerViaRelayer(
          registrationProof,
          eDoc,
          Buffer.from(slaveCertSmtProof.root),
          circuitTypeCertificatePubKeySize,
          true,
        )
      } catch (e) {
        console.log({ ...e })
      }
    },
    [
      circuitType,
      passportInfo?.passportInfo_.activeIdentity,
      registerViaRelayer,
      registrationProof,
      rmoEvmJsonRpcProvider,
      slaveCertSmtProof,
    ],
  )

  const createIdentity = useCallback(async () => {
    if (!eDocument) return

    try {
      setCurrentStep(Steps.GenerateProofStep)

      const icaoAsset = assets?.[0]

      if (!icaoAsset?.localUri) throw new TypeError('ICAO asset not found')

      const icaoBase64 = await FileSystem.readAsStringAsync(icaoAsset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const icaoBytes = Buffer.from(icaoBase64, 'base64')

      if (!eDocument.sod) throw new TypeError('SOD not found')

      const sodBytes = Buffer.from(eDocument.sod, 'base64')

      const publicKeyPem = await getPublicKeyPem(sodBytes)
      const pubKeySize = await getX509RSASize(publicKeyPem)
      const slaveCertPem = await getSlaveCertificatePem(sodBytes)
      const slaveCertIdx = await getSlaveCertIndex(slaveCertPem, icaoBytes)
      const _circuitType = getCircuitType(pubKeySize)
      setCircuitType(_circuitType)

      if (!_circuitType) throw new TypeError('Unsupported public key size')

      const smtProof = await certPoseidonSMTContract.contractInstance.getProof(
        ethers.zeroPadValue(slaveCertIdx, 32),
      )
      setSlaveCertSmtProof(smtProof)

      if (!smtProof.existence) {
        try {
          await registerCertificate(slaveCertPem)
        } catch (error) {
          console.log(error)
          if (!(error instanceof CertificateAlreadyRegisteredError)) {
            throw error
          }
        }
      }

      const regProof = await getIdentityRegProof(eDocument, _circuitType, publicKeyPem, smtProof)
      setRegistrationProof(regProof)

      const _passportInfo = await getPassportInfo(eDocument, regProof)
      setPassportInfo(_passportInfo)

      try {
        await registerIdentity(regProof, eDocument, smtProof, _circuitType, _passportInfo)
      } catch (error) {
        if (error instanceof PassportRegisteredWithAnotherPKError) {
          setCurrentStep(Steps.RevocationStep)
        } else {
          throw error
        }
      }
    } catch (error) {
      console.log(error)
      bus.emit(DefaultBusEvents.error, {
        message: 'Failed to register identity',
      })
      setCurrentStep(Steps.DocumentPreviewStep)
    }
  }, [
    assets,
    certPoseidonSMTContract.contractInstance,
    eDocument,
    getIdentityRegProof,
    getPassportInfo,
    registerCertificate,
    registerIdentity,
  ])

  // ---------------------------------------------------------------------------------------------

  const identityCreationProcess = useMemo(() => {
    return (
      <View>
        <Text className={'text-textPrimary typography-subtitle4'}>Downloading Progress:</Text>
        <Text className={'text-textPrimary typography-body3'}>
          {restCircuit.downloadingProgress}
        </Text>

        <Text className={'text-textPrimary typography-subtitle4'}>isLoaded:</Text>
        <Text className={'text-textPrimary typography-body3'}>{String(restCircuit.isLoaded)}</Text>

        <Text className={'text-textPrimary typography-subtitle4'}>isCircuitsLoadFailed:</Text>
        <Text className={'text-textPrimary typography-body3'}>
          {String(restCircuit.isLoadFailed)}
        </Text>
      </View>
    )
  }, [restCircuit.downloadingProgress, restCircuit.isLoadFailed, restCircuit.isLoaded])

  const handleSetSelectedDocType = useCallback((value: DocType) => {
    setSelectedDocType(value)
    setCurrentStep(Steps.ScanMrzStep)
  }, [])

  const handleSetMrz = useCallback((value: FieldRecords) => {
    setMrz(value)
    setCurrentStep(Steps.ScanNfcStep)
  }, [])

  const handleSetEDoc = useCallback((value: EDocument) => {
    setEDocument(value)
    setCurrentStep(Steps.DocumentPreviewStep)
  }, [])

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

        createIdentity,
        identityCreationProcess,

        getRevocationChallenge,
        revokeIdentity,
      }}
      children={children}
    />
  )
}
