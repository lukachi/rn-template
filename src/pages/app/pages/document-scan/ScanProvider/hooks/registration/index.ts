import { buildCertTreeAndGenProof, parseLdifString } from '@lukachi/rn-csca'
import { scanDocument } from '@modules/e-document'
import { groth16ProveWithZKeyFilePath, ZKProof } from '@modules/rapidsnark-wrp'
import { ECParameters } from '@peculiar/asn1-ecc'
import { id_pkcs_1, RSAPublicKey } from '@peculiar/asn1-rsa'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { AxiosError } from 'axios'
import { ethers, getBytes, JsonRpcProvider, keccak256, toBeArray, zeroPadValue } from 'ethers'
import * as FileSystem from 'expo-file-system'
import { FieldRecords } from 'mrz'
import { useCallback, useMemo, useRef, useState } from 'react'

import { RARIMO_CHAINS } from '@/api/modules/rarimo'
import { relayerRegister } from '@/api/modules/registration'
import { Config } from '@/config'
import { ErrorHandler } from '@/core'
import { createPoseidonSMTContract } from '@/helpers'
import { tryCatch } from '@/helpers/try-catch'
import {
  CertificateAlreadyRegisteredError,
  PassportRegisteredWithAnotherPKError,
} from '@/store/modules/identity/errors'
import { IdentityItem } from '@/store/modules/identity/Identity'
import { walletStore } from '@/store/modules/wallet'
import { Registration__factory, StateKeeper } from '@/types'
import { SparseMerkleTree } from '@/types/contracts/PoseidonSMT'
import { Groth16VerifierHelper, Registration2 } from '@/types/contracts/Registration'
import { getCircuitHashAlgorithm } from '@/utils/circuits/helpers'
import { RegistrationCircuit } from '@/utils/circuits/registration-circuit'
import { EDocument } from '@/utils/e-document/e-document'
import { getPublicKeyFromEcParameters } from '@/utils/e-document/helpers/crypto'
import { ECDSA_ALGO_PREFIX, Sod } from '@/utils/e-document/sod'

const ZERO_BYTES32_HEX = ethers.encodeBytes32String('')

type PassportInfo = {
  passportInfo_: StateKeeper.PassportInfoStructOutput
  identityInfo_: StateKeeper.IdentityInfoStructOutput
}

const icaoDownloadUrl =
  'https://www.googleapis.com/download/storage/v1/b/rarimo-temp/o/icaopkd-list.ldif?generation=1715355629405816&alt=media'
const icaoPkdFileUri = `${FileSystem.documentDirectory}/icaopkd-list.ldif`

export const useRegistration = () => {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)
  const publicKeyHash = walletStore.usePublicKeyHash()

  const downloadResumable = useMemo(() => {
    return FileSystem.createDownloadResumable(icaoDownloadUrl, icaoPkdFileUri, {})
  }, [])

  // ----------------------------------------------------------------------------------------

  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadFailed, setIsLoadFailed] = useState(false)
  const [downloadingProgress, setDownloadingProgress] = useState('')

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

  const registrationContractInterface = Registration__factory.createInterface()

  // ----------------------------------------------------------------------------------------

  const newBuildRegisterCertCallData = useCallback(
    async (CSCABytes: ArrayBuffer[], tempEDoc: EDocument, masterCert: Certificate) => {
      const inclusionProofSiblings = buildCertTreeAndGenProof(
        CSCABytes,
        AsnConvert.serialize(masterCert),
      )

      if (inclusionProofSiblings.length === 0) {
        throw new TypeError('failed to generate inclusion proof')
      }

      const dispatcherName = (() => {
        const masterSubjPubKeyAlg =
          masterCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm

        if (masterSubjPubKeyAlg.includes(id_pkcs_1)) {
          const bits = (() => {
            if (
              tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(
                id_pkcs_1,
              )
            ) {
              const slaveRSAPubKey = AsnConvert.parse(
                tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo
                  .subjectPublicKey,
                RSAPublicKey,
              )

              const modulusBytes = new Uint8Array(slaveRSAPubKey.modulus)

              const unpaddedRsaPubKey =
                modulusBytes[0] === 0x00 ? modulusBytes.subarray(1) : modulusBytes

              return (unpaddedRsaPubKey.byteLength * 8).toString()
            }

            if (
              tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(
                ECDSA_ALGO_PREFIX,
              )
            ) {
              if (
                !tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo
                  .algorithm.parameters
              )
                throw new TypeError('ECDSA public key does not have parameters')

              const ecParameters = AsnConvert.parse(
                tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo
                  .algorithm.parameters,
                ECParameters,
              )

              const [publicKey] = getPublicKeyFromEcParameters(
                ecParameters,
                new Uint8Array(
                  tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
                ),
              )

              const rawPoint = new Uint8Array([
                ...toBeArray(publicKey.px),
                ...toBeArray(publicKey.py),
              ])

              return rawPoint.length * 8
            }
          })()

          let dispatcherName = `C_RSA`

          const circuitHashAlgorithm = getCircuitHashAlgorithm(
            tempEDoc.sod.slaveCertificate.certificate,
          )
          if (circuitHashAlgorithm) {
            dispatcherName += `_${circuitHashAlgorithm}`
          }

          dispatcherName += `_${bits}`

          return dispatcherName
        }

        if (masterSubjPubKeyAlg.includes(ECDSA_ALGO_PREFIX)) {
          if (!masterCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters) {
            throw new TypeError('Master ECDSA public key does not have parameters')
          }

          if (
            !tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm
              .parameters
          ) {
            throw new TypeError('Slave ECDSA public key does not have parameters')
          }

          const masterEcParameters = AsnConvert.parse(
            masterCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
            ECParameters,
          )

          const slaveEcParameters = AsnConvert.parse(
            tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm
              .parameters,
            ECParameters,
          )

          const [, , masterCertCurveName] = getPublicKeyFromEcParameters(
            masterEcParameters,
            new Uint8Array(masterCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
          )

          const [slaveCertPubKey] = getPublicKeyFromEcParameters(
            slaveEcParameters,
            new Uint8Array(
              tempEDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
            ),
          )

          const pubKeyBytes = new Uint8Array([
            ...toBeArray(slaveCertPubKey.px),
            ...toBeArray(slaveCertPubKey.py),
          ])

          const bits = pubKeyBytes.length * 8

          let dispatcherName = `C_ECDSA_${masterCertCurveName}`

          const circuitHashAlgorithm = getCircuitHashAlgorithm(
            tempEDoc.sod.slaveCertificate.certificate,
          )
          if (circuitHashAlgorithm) {
            dispatcherName += `_${circuitHashAlgorithm}`
          }

          dispatcherName += `_${bits}`

          return dispatcherName
        }

        throw new Error(`unsupported public key type: ${masterSubjPubKeyAlg}`)
      })()

      const dispatcherHash = getBytes(keccak256(Buffer.from(dispatcherName, 'utf-8')))

      const certificate: Registration2.CertificateStruct = {
        dataType: dispatcherHash,
        signedAttributes: new Uint8Array(
          AsnConvert.serialize(tempEDoc.sod.slaveCertificate.certificate.tbsCertificate),
        ),
        keyOffset: tempEDoc.sod.slaveCertificate.slaveCertPubKeyOffset,
        expirationOffset: tempEDoc.sod.slaveCertificate.slaveCertExpOffset,
      }
      const icaoMember: Registration2.ICAOMemberStruct = {
        signature: tempEDoc.sod.slaveCertificate.getSlaveCertIcaoMemberSignature(masterCert),
        publicKey: Sod.getSlaveCertIcaoMemberKey(masterCert),
      }

      return registrationContractInterface.encodeFunctionData('registerCertificate', [
        certificate,
        icaoMember,
        inclusionProofSiblings.map(el => Buffer.from(el, 'hex')),
      ])
    },
    [registrationContractInterface],
  )

  const registerCertificate = useCallback(
    async (CSCABytes: ArrayBuffer[], tempEDoc: EDocument, slaveMaster: Certificate) => {
      try {
        const newCallData = await newBuildRegisterCertCallData(CSCABytes, tempEDoc, slaveMaster)

        const { data } = await relayerRegister(newCallData, Config.REGISTRATION_CONTRACT_ADDRESS)

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
    [newBuildRegisterCertCallData, rmoEvmJsonRpcProvider],
  )

  const getIdentityRegProof = useCallback(
    async (smtProof: SparseMerkleTree.ProofStructOutput, circuit: RegistrationCircuit) => {
      const { datBytes, zkeyLocalUri } = await circuit.circuitParams.retrieveZkeyNDat({
        onDownloadStart() {},
        onDownloadingProgress(downloadProgressData) {
          setDownloadingProgress(
            `${downloadProgressData.totalBytesWritten} / ${downloadProgressData.totalBytesExpectedToWrite}`,
          )
        },
        onFailed(_) {
          setIsLoadFailed(true)
        },
        onLoaded() {
          setIsLoaded(true)
        },
      })

      const wtns = await circuit.calcWtns(
        {
          skIdentity: BigInt(`0x${privateKey}`),
          slaveMerkleRoot: BigInt(smtProof.root),
          slaveMerkleInclusionBranches: smtProof.siblings.map(el => BigInt(el)),
        },
        datBytes,
      )

      const registerIdentityZkProofBytes = await groth16ProveWithZKeyFilePath(wtns, zkeyLocalUri)

      return JSON.parse(Buffer.from(registerIdentityZkProofBytes).toString()) as ZKProof
    },
    [privateKey],
  )

  const newBuildRegisterCallData = useCallback(
    (
      identityItem: IdentityItem,
      slaveCertSmtProof: SparseMerkleTree.ProofStructOutput,
      circuit: RegistrationCircuit,
      isRevoked: boolean,
    ) => {
      const aaSignature = identityItem.document.getAASignature()

      if (!aaSignature) throw new TypeError('AA signature is not defined')

      const parts = circuit.name.split('_')

      if (parts.length < 2) {
        throw new Error('circuit name is in invalid format')
      }

      // ZKTypePrefix represerts the circuit zk type prefix
      const ZKTypePrefix = 'Z_PER_PASSPORT'

      const zkTypeSuffix = parts.slice(1).join('_') // support for multi-underscore suffix
      const zkTypeName = `${ZKTypePrefix}_${zkTypeSuffix}`

      const passport: Registration2.PassportStruct = {
        dataType: identityItem.document.getAADataType(circuit.keySize),
        zkType: keccak256(zkTypeName),
        signature: aaSignature,
        publicKey: (() => {
          const aaPublicKey = identityItem.document.getAAPublicKey()

          if (!aaPublicKey) return identityItem.passportKey

          return aaPublicKey
        })(),
        passportHash: identityItem.passportHash,
      }

      const proofPoints: Groth16VerifierHelper.ProofPointsStruct = {
        a: [
          BigInt(identityItem.registrationProof.proof.pi_a[0]),
          BigInt(identityItem.registrationProof.proof.pi_a[1]),
        ],
        b: [
          [
            BigInt(identityItem.registrationProof.proof.pi_b[0][0]),
            BigInt(identityItem.registrationProof.proof.pi_b[0][1]),
          ],
          [
            BigInt(identityItem.registrationProof.proof.pi_b[1][0]),
            BigInt(identityItem.registrationProof.proof.pi_b[1][1]),
          ],
        ],
        c: [
          BigInt(identityItem.registrationProof.proof.pi_c[0]),
          BigInt(identityItem.registrationProof.proof.pi_c[1]),
        ],
      }

      if (isRevoked) {
        return registrationContractInterface.encodeFunctionData('reissueIdentity', [
          slaveCertSmtProof.root,
          identityItem.pkIdentityHash,
          identityItem.dg1Commitment,
          passport,
          proofPoints,
        ])
      }

      return registrationContractInterface.encodeFunctionData('register', [
        slaveCertSmtProof.root,
        identityItem.pkIdentityHash,
        identityItem.dg1Commitment,
        passport,
        proofPoints,
      ])
    },
    [registrationContractInterface],
  )

  const requestRelayerRegisterMethod = useCallback(
    async (
      identityItem: IdentityItem,
      slaveCertSmtProof: SparseMerkleTree.ProofStructOutput,
      circuit: RegistrationCircuit,
      isRevoked: boolean,
    ) => {
      const registerCallData = newBuildRegisterCallData(
        identityItem,
        slaveCertSmtProof,
        circuit,
        isRevoked,
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
      identityItem: IdentityItem,
      slaveCertSmtProof: SparseMerkleTree.ProofStructOutput,
      passportInfo: PassportInfo | null,
      circuit: RegistrationCircuit,
    ): Promise<void> => {
      const currentIdentityKey = publicKeyHash
      const currentIdentityKeyHex = ethers.hexlify(currentIdentityKey)

      const isPassportNotRegistered =
        !passportInfo || passportInfo.passportInfo_.activeIdentity === ZERO_BYTES32_HEX

      const isPassportRegisteredWithCurrentPK =
        passportInfo?.passportInfo_.activeIdentity === currentIdentityKeyHex

      if (isPassportNotRegistered) {
        await requestRelayerRegisterMethod(identityItem, slaveCertSmtProof, circuit, false)
      }

      if (!isPassportRegisteredWithCurrentPK) {
        throw new PassportRegisteredWithAnotherPKError()
      }
    },
    [publicKeyHash, requestRelayerRegisterMethod],
  )

  const getRevocationChallenge = useCallback(
    async (identityItem: IdentityItem): Promise<Uint8Array> => {
      const passportInfo = await identityItem.getPassportInfo()

      if (!passportInfo?.passportInfo_.activeIdentity)
        throw new TypeError('Active identity not found')

      const challenge = ethers.getBytes(passportInfo.passportInfo_.activeIdentity).slice(24, 32)

      return challenge
    },
    [],
  )

  const getSlaveCertSmtProof = useCallback(
    async (tempEDoc: EDocument) => {
      return certPoseidonSMTContract.contractInstance.getProof(
        zeroPadValue(tempEDoc.sod.slaveCertificate.slaveCertificateIndex, 32),
      )
    },
    [certPoseidonSMTContract.contractInstance],
  )

  const resolveRevokedEDocument = useRef<(value: EDocument | PromiseLike<EDocument>) => void>()
  const rejectRevokedEDocument = useRef<(reason?: unknown) => void>()

  const revokeIdentity = useCallback(
    async (
      tempMRZ: FieldRecords,
      currentIdentityItem: IdentityItem,
      _passportInfo?: PassportInfo | null,
      _slaveCertSmtProof?: SparseMerkleTree.ProofStructOutput,
    ) => {
      if (
        !tempMRZ.birthDate ||
        !tempMRZ.documentNumber ||
        !tempMRZ.expirationDate ||
        !tempMRZ.documentCode
      )
        throw new TypeError('MRZ data is empty')

      const challenge = await getRevocationChallenge(currentIdentityItem)

      const eDocumentResponse = await scanDocument(
        tempMRZ.documentCode,
        {
          dateOfBirth: tempMRZ.birthDate,
          dateOfExpiry: tempMRZ.expirationDate,
          documentNumber: tempMRZ.documentNumber,
        },
        challenge,
      )

      const revokedEDocument = currentIdentityItem.document || eDocumentResponse
      revokedEDocument.aaSignature = eDocumentResponse.aaSignature

      const circuit = new RegistrationCircuit(revokedEDocument)

      const [passportInfo, getPassportInfoError] = await (async () => {
        if (_passportInfo) return [_passportInfo, null]

        return tryCatch(currentIdentityItem.getPassportInfo())
      })()
      if (getPassportInfoError) {
        throw new TypeError('Failed to get passport info', getPassportInfoError)
      }

      if (!passportInfo?.passportInfo_.activeIdentity)
        throw new TypeError('Active identity not found')

      const aaSignature = revokedEDocument.getAASignature()

      if (!aaSignature) throw new TypeError('AA signature is not defined')

      const isPassportRegistered = passportInfo?.passportInfo_.activeIdentity !== ZERO_BYTES32_HEX

      if (isPassportRegistered) {
        const passport: Registration2.PassportStruct = {
          dataType: revokedEDocument.getAADataType(circuit.keySize),
          zkType: ZERO_BYTES32_HEX,
          signature: aaSignature,
          publicKey: revokedEDocument.getAAPublicKey() || ZERO_BYTES32_HEX,
          passportHash: ZERO_BYTES32_HEX,
        }

        const txCallData = registrationContractInterface.encodeFunctionData('revoke', [
          passportInfo?.passportInfo_.activeIdentity,
          passport,
        ])

        try {
          const { data } = await relayerRegister(txCallData, Config.REGISTRATION_CONTRACT_ADDRESS)

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

      const [slaveCertSmtProof, getSlaveCertSmtProofError] = await (async () => {
        if (_slaveCertSmtProof) return [_slaveCertSmtProof, null]

        return tryCatch(getSlaveCertSmtProof(currentIdentityItem.document))
      })()
      if (getSlaveCertSmtProofError) {
        throw new TypeError('Slave certificate SMT proof not found', getSlaveCertSmtProofError)
      }

      await requestRelayerRegisterMethod(currentIdentityItem, slaveCertSmtProof, circuit, true)
    },
    [
      getRevocationChallenge,
      getSlaveCertSmtProof,
      registrationContractInterface,
      requestRelayerRegisterMethod,
      rmoEvmJsonRpcProvider,
    ],
  )

  // ---------------------------------------------------------------------------------------------

  const createIdentity = useCallback(
    async (
      tempEDoc: EDocument,
      opts: {
        onRevocation: (identityItem: IdentityItem) => void
      },
    ): Promise<IdentityItem> => {
      if (!(await FileSystem.getInfoAsync(icaoPkdFileUri)).exists) {
        await downloadResumable.downloadAsync()
      }

      const icaoLdif = await FileSystem.readAsStringAsync(icaoPkdFileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      })

      const CSCACertBytes = parseLdifString(icaoLdif)

      const slaveMaster = await tempEDoc.sod.slaveCertificate.getSlaveMaster(CSCACertBytes)

      const [slaveCertSmtProof, getSlaveCertSmtProofError] = await tryCatch(
        getSlaveCertSmtProof(tempEDoc),
      )
      if (getSlaveCertSmtProofError) {
        throw new TypeError('Slave certificate SMT proof not found', getSlaveCertSmtProofError)
      }

      if (!slaveCertSmtProof.existence) {
        const [, registerCertificateError] = await tryCatch(
          registerCertificate(CSCACertBytes, tempEDoc, slaveMaster),
        )
        if (registerCertificateError) {
          ErrorHandler.processWithoutFeedback(registerCertificateError)

          if (!(registerCertificateError instanceof CertificateAlreadyRegisteredError)) {
            throw new TypeError('Failed to register slave certificate', registerCertificateError)
          }
        }
      }

      const registrationCircuit = new RegistrationCircuit(tempEDoc)

      const [regProof, getRegProofError] = await tryCatch(
        getIdentityRegProof(slaveCertSmtProof, registrationCircuit),
      )
      if (getRegProofError) {
        throw new TypeError('Failed to get identity registration proof', getRegProofError)
      }
      const identityItem = new IdentityItem(tempEDoc, regProof)

      const [passportInfo, getPassportInfoError] = await tryCatch(identityItem.getPassportInfo())
      if (getPassportInfoError) {
        throw new TypeError('Failed to get passport info', getPassportInfoError)
      }

      const [, registerIdentityError] = await tryCatch(
        registerIdentity(identityItem, slaveCertSmtProof, passportInfo, registrationCircuit),
      )
      if (registerIdentityError) {
        if (registerIdentityError instanceof PassportRegisteredWithAnotherPKError) {
          opts?.onRevocation?.(identityItem)
        }

        throw registerIdentityError
      }

      return identityItem
    },
    [
      downloadResumable,
      getIdentityRegProof,
      getSlaveCertSmtProof,
      registerCertificate,
      registerIdentity,
    ],
  )

  return {
    circuitLoadingDetails: {
      isLoaded,
      isLoadFailed,
      downloadingProgress,
    },
    resolveRevokedEDocument,
    rejectRevokedEDocument,

    revokeIdentity,
    createIdentity,
    getRevocationChallenge,
  }
}
