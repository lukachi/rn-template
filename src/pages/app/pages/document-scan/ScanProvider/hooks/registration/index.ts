import { buildCertTreeAndGenProof, parsePemString } from '@lukachi/rn-csca'
import { scanDocument } from '@modules/e-document'
import { ECParameters } from '@peculiar/asn1-ecc'
import { id_pkcs_1, RSAPublicKey } from '@peculiar/asn1-rsa'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { AxiosError } from 'axios'
import { ethers, getBytes, JsonRpcProvider, keccak256, toBeArray, zeroPadValue } from 'ethers'
import { Asset } from 'expo-asset'
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
import { Registration2 } from '@/types/contracts/Registration'
import { getCircuitHashAlgorithm } from '@/utils/circuits/helpers'
import {
  NoirEIDBasedRegistrationCircuit,
  NoirEPassportBasedRegistrationCircuit,
} from '@/utils/circuits/registration/noir-registration-circuit'
import { EDocument, EID, EPassport } from '@/utils/e-document/e-document'
import { ExtendedCertificate } from '@/utils/e-document/extended-cert'
import { getPublicKeyFromEcParameters } from '@/utils/e-document/helpers/crypto'
import { ECDSA_ALGO_PREFIX, Sod } from '@/utils/e-document/sod'

import { useRegisterContracts } from './register-contracts'

const ZERO_BYTES32_HEX = ethers.encodeBytes32String('')

type PassportInfo = {
  passportInfo_: StateKeeper.PassportInfoStructOutput
  identityInfo_: StateKeeper.IdentityInfoStructOutput
}

export const useRegistration = () => {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)
  const publicKeyHash = walletStore.usePublicKeyHash()

  const registerContracts = useRegisterContracts()

  // ----------------------------------------------------------------------------------------

  const [isLoaded] = useState(false)
  const [isLoadFailed] = useState(false)
  const [downloadingProgress] = useState('')

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
    async (CSCABytes: ArrayBuffer[], cert: ExtendedCertificate, masterCert: Certificate) => {
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
              cert.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(
                id_pkcs_1,
              )
            ) {
              const slaveRSAPubKey = AsnConvert.parse(
                cert.certificate.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
                RSAPublicKey,
              )

              const modulusBytes = new Uint8Array(slaveRSAPubKey.modulus)

              const unpaddedRsaPubKey =
                modulusBytes[0] === 0x00 ? modulusBytes.subarray(1) : modulusBytes

              return (unpaddedRsaPubKey.byteLength * 8).toString()
            }

            if (
              cert.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(
                ECDSA_ALGO_PREFIX,
              )
            ) {
              if (!cert.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters)
                throw new TypeError('ECDSA public key does not have parameters')

              const ecParameters = AsnConvert.parse(
                cert.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
                ECParameters,
              )

              const [publicKey] = getPublicKeyFromEcParameters(
                ecParameters,
                new Uint8Array(
                  cert.certificate.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
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

          const circuitHashAlgorithm = getCircuitHashAlgorithm(cert.certificate)
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

          if (!cert.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters) {
            throw new TypeError('Slave ECDSA public key does not have parameters')
          }

          const masterEcParameters = AsnConvert.parse(
            masterCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
            ECParameters,
          )

          const slaveEcParameters = AsnConvert.parse(
            cert.certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
            ECParameters,
          )

          const [, , masterCertCurveName] = getPublicKeyFromEcParameters(
            masterEcParameters,
            new Uint8Array(masterCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
          )

          const [slaveCertPubKey] = getPublicKeyFromEcParameters(
            slaveEcParameters,
            new Uint8Array(cert.certificate.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
          )

          const pubKeyBytes = new Uint8Array([
            ...toBeArray(slaveCertPubKey.px),
            ...toBeArray(slaveCertPubKey.py),
          ])

          const bits = pubKeyBytes.length * 8

          let dispatcherName = `C_ECDSA_${masterCertCurveName}`

          const circuitHashAlgorithm = getCircuitHashAlgorithm(cert.certificate)
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
        signedAttributes: new Uint8Array(AsnConvert.serialize(cert.certificate.tbsCertificate)),
        keyOffset: cert.slaveCertPubKeyOffset,
        expirationOffset: cert.slaveCertExpOffset,
      }
      const icaoMember: Registration2.ICAOMemberStruct = {
        signature: cert.getSlaveCertIcaoMemberSignature(masterCert),
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
    async (CSCABytes: ArrayBuffer[], cert: ExtendedCertificate, slaveMaster: Certificate) => {
      try {
        const newCallData = await newBuildRegisterCertCallData(CSCABytes, cert, slaveMaster)

        const { data } = await relayerRegister(newCallData, Config.REGISTRATION_CONTRACT_ADDRESS)

        const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

        if (!tx) throw new TypeError('Transaction not found')

        await tx.wait()
      } catch (error) {
        const axiosError = error as AxiosError

        const stringifiedError = JSON.stringify(axiosError.response?.data)

        if (
          stringifiedError?.includes('the key already exists') &&
          // TODO: remove once contracts got fixed
          stringifiedError?.includes('code = Unknown desc = execution reverted')
        ) {
          throw new CertificateAlreadyRegisteredError()
        }

        throw axiosError
      }
    },
    [newBuildRegisterCertCallData, rmoEvmJsonRpcProvider],
  )

  const requestRelayerRegisterMethod = useCallback(
    async (
      identityItem: IdentityItem,
      slaveCertSmtProof: SparseMerkleTree.ProofStructOutput,
      isRevoked: boolean,
    ) => {
      // TODO: handle circom
      const registerCallData = await registerContracts.buildNoirRegisterCallData(
        identityItem,
        slaveCertSmtProof,
        isRevoked,
      )

      const { data } = await relayerRegister(registerCallData, Config.REGISTRATION_CONTRACT_ADDRESS)

      const tx = await rmoEvmJsonRpcProvider.getTransaction(data.tx_hash)

      if (!tx) throw new TypeError('Transaction not found')

      await tx.wait()
    },
    [registerContracts, rmoEvmJsonRpcProvider],
  )

  const registerIdentity = useCallback(
    async (
      identityItem: IdentityItem,
      slaveCertSmtProof: SparseMerkleTree.ProofStructOutput,
      passportInfo: PassportInfo | null,
    ): Promise<void> => {
      const currentIdentityKey = publicKeyHash
      const currentIdentityKeyHex = ethers.hexlify(currentIdentityKey)

      const isPassportNotRegistered =
        !passportInfo || passportInfo.passportInfo_.activeIdentity === ZERO_BYTES32_HEX

      const isPassportRegisteredWithCurrentPK =
        passportInfo?.passportInfo_.activeIdentity === currentIdentityKeyHex

      if (isPassportNotRegistered) {
        await requestRelayerRegisterMethod(identityItem, slaveCertSmtProof, false)
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
    async (cert: ExtendedCertificate) => {
      return certPoseidonSMTContract.contractInstance.getProof(
        zeroPadValue(cert.slaveCertificateIndex, 32),
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
      const currentIdentityItemDocument = currentIdentityItem.document

      if (
        revokedEDocument instanceof EPassport &&
        currentIdentityItemDocument instanceof EPassport &&
        eDocumentResponse instanceof EPassport
      ) {
        revokedEDocument.aaSignature = eDocumentResponse.aaSignature

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
            dataType: revokedEDocument.getAADataType(revokedEDocument.sod.slaveCertificate.keySize),
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

          return tryCatch(getSlaveCertSmtProof(currentIdentityItemDocument.sod.slaveCertificate))
        })()
        if (getSlaveCertSmtProofError) {
          throw new TypeError('Slave certificate SMT proof not found', getSlaveCertSmtProofError)
        }

        await requestRelayerRegisterMethod(currentIdentityItem, slaveCertSmtProof, true)
      }

      if (revokedEDocument instanceof EID) {
        throw new TypeError('EID revocation is not supported yet')
      }

      throw new TypeError('Unsupported document type for revocation')
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
      const targetCertificate = (() => {
        if (tempEDoc instanceof EPassport) {
          return tempEDoc.sod.slaveCertificate
        }

        if (tempEDoc instanceof EID) {
          return tempEDoc.authCertificate
        }

        throw new TypeError('Unsupported document type for identity creation')
      })()

      const [CSCAPemAsset] = await Asset.loadAsync(
        require('@assets/certificates/master_000316.pem'),
      )

      if (!CSCAPemAsset.localUri) throw new Error('CSCA cert asset local URI is not available')

      const CSCAPemFileInfo = await FileSystem.getInfoAsync(CSCAPemAsset.localUri)

      if (!CSCAPemFileInfo.exists) throw new Error('CSCA cert file does not exist')

      const CSCAPemFileContent = await FileSystem.readAsStringAsync(CSCAPemFileInfo.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      })

      const CSCACertBytes = parsePemString(CSCAPemFileContent)

      const [slaveMaster, getSlaveMasterError] = await tryCatch(
        targetCertificate.getSlaveMaster(CSCACertBytes),
      )
      if (getSlaveMasterError) {
        throw new TypeError('Failed to get slave master certificate', getSlaveMasterError)
      }

      const [slaveCertSmtProof, getSlaveCertSmtProofError] = await tryCatch(
        getSlaveCertSmtProof(targetCertificate),
      )
      if (getSlaveCertSmtProofError) {
        throw new TypeError('Slave certificate SMT proof not found', getSlaveCertSmtProofError)
      }

      if (!slaveCertSmtProof.existence) {
        const [, registerCertificateError] = await tryCatch(
          registerCertificate(CSCACertBytes, targetCertificate, slaveMaster),
        )
        if (registerCertificateError) {
          ErrorHandler.processWithoutFeedback(registerCertificateError)

          if (!(registerCertificateError instanceof CertificateAlreadyRegisteredError)) {
            throw new TypeError('Failed to register slave certificate', registerCertificateError)
          }
        }
      }

      const circuit = (() => {
        if (tempEDoc instanceof EPassport) {
          return new NoirEPassportBasedRegistrationCircuit(tempEDoc)
        }

        if (tempEDoc instanceof EID) {
          return new NoirEIDBasedRegistrationCircuit(tempEDoc)
        }

        throw new TypeError('Unsupported document type for identity creation')
      })()

      // TODO: prove in different thread
      const [regProof, getRegProofError] = await tryCatch(
        circuit.prove({
          skIdentity: BigInt(`0x${privateKey}`),
          icaoRoot: BigInt(slaveCertSmtProof.root),
          inclusionBranches: slaveCertSmtProof.siblings.map(el => BigInt(el)),
        }),
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
        registerIdentity(identityItem, slaveCertSmtProof, passportInfo),
      )
      if (registerIdentityError) {
        if (registerIdentityError instanceof PassportRegisteredWithAnotherPKError) {
          opts?.onRevocation?.(identityItem)
        }

        throw registerIdentityError
      }

      return identityItem
    },
    [getSlaveCertSmtProof, privateKey, registerCertificate, registerIdentity],
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
