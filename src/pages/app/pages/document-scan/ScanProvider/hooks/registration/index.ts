import { InMemoryDB, Merkletree } from '@iden3/js-merkletree'
import { scanDocument } from '@modules/e-document'
import { groth16ProveWithZKeyFilePath, ZKProof } from '@modules/rapidsnark-wrp'
import {
  ECParameters,
  id_ecdsaWithSHA1,
  id_ecdsaWithSHA256,
  id_ecdsaWithSHA384,
  id_ecdsaWithSHA512,
} from '@peculiar/asn1-ecc'
import {
  id_pkcs_1,
  id_RSASSA_PSS,
  id_sha1WithRSAEncryption,
  id_sha256WithRSAEncryption,
  id_sha384WithRSAEncryption,
  id_sha512WithRSAEncryption,
  RSAPublicKey,
} from '@peculiar/asn1-rsa'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { X509Certificate } from '@peculiar/x509'
import { AxiosError } from 'axios'
import { decodeBase64, ethers, getBytes, JsonRpcProvider, keccak256, zeroPadValue } from 'ethers'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { FieldRecords } from 'mrz'
import forge from 'node-forge'
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
import { padBitsToFixedBlocks } from '@/utils/circuits/helpers'
import { RegistrationCircuit } from '@/utils/circuits/registration-circuit'
import { EDocument } from '@/utils/e-document/e-document'
import { ECDSA_ALGO_PREFIX } from '@/utils/e-document/sod'

const ZERO_BYTES32_HEX = ethers.encodeBytes32String('')

type PassportInfo = {
  passportInfo_: StateKeeper.PassportInfoStructOutput
  identityInfo_: StateKeeper.IdentityInfoStructOutput
}

export const useRegistration = () => {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)
  const publicKeyHash = walletStore.usePublicKeyHash()

  const [assets] = useAssets([require('@assets/certificates/ICAO.pem')])

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
    async (CSCAs: Certificate[], tempEDoc: EDocument, slaveMaster: X509Certificate) => {
      // priority = keccak256.Hash(key) % (2^64-1)
      function toField(bytes: Uint8Array): bigint {
        const bi = BigInt('0x' + Buffer.from(bytes).toString('hex'))
        return bi % (2n ** 64n - 1n)
      }

      // TODO: replace with merkletree lib
      const [icaoTree, getIcaoTreeError] = await tryCatch(
        (async () => {
          const db = new InMemoryDB(new Uint8Array([0])) // arbitrary prefix
          const tree = new Merkletree(db, true, 256)

          for (const cert of CSCAs) {
            const digest = keccak256(
              new Uint8Array(cert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
            )
            const value = toField(getBytes(digest))

            await tryCatch(tree.add(BigInt(digest), value))
          }

          return tree
        })(),
      )
      if (getIcaoTreeError) {
        throw new TypeError(`Failed to create ICAO Merkle tree: ${getIcaoTreeError}`)
      }

      const [inclusionProof, getInclusionProofError] = await tryCatch(
        (async () => {
          const leafDigest = keccak256(new Uint8Array(slaveMaster.publicKey.rawData))
          const { proof } = await icaoTree.generateProof(toField(getBytes(leafDigest)))
          return { root: await icaoTree.root(), proof }
        })(),
      )
      if (getInclusionProofError) {
        throw new TypeError(`Failed to generate inclusion proof: ${getInclusionProofError.message}`)
      }

      if (inclusionProof.proof.allSiblings().length <= 0) {
        throw new TypeError('failed to generate inclusion proof')
      }

      const masterCert = AsnConvert.parse(slaveMaster.rawData, Certificate)

      const icaoMemberSignature = tempEDoc.sod.getSlaveCertIcaoMemberSignature(masterCert)
      const icaoMemberKey = tempEDoc.sod.getSlaveCertIcaoMemberKey(masterCert)

      const x509KeyOffset = tempEDoc.sod.slaveCertX509KeyOffset
      const expOffset = tempEDoc.sod.slaveCertExpOffset

      const dispatcherName = (() => {
        const subjPubKeyAlg =
          tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm

        if (subjPubKeyAlg.includes(id_pkcs_1)) {
          return dispatcherForRSA(tempEDoc.sod.slaveCert)
        }

        if (subjPubKeyAlg.includes(ECDSA_ALGO_PREFIX)) {
          return dispatcherForECDSA(tempEDoc.sod.slaveCert)
        }

        throw new Error(`unsupported public key type: ${subjPubKeyAlg}`)

        /* ----------  RSA family  ------------------------------------------------- */
        function dispatcherForRSA(slave: Certificate): string {
          const slaveRSAPubKey = AsnConvert.parse(
            slave.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
            RSAPublicKey,
          )

          const bits = (slaveRSAPubKey.modulus.byteLength * 8).toString()

          switch (slave.signatureAlgorithm.algorithm) {
            case id_sha1WithRSAEncryption:
              return `C_RSA_SHA1_${bits}`
            case id_sha256WithRSAEncryption:
              return `C_RSA_${bits}`
            case id_sha384WithRSAEncryption:
              return `C_RSA_SHA384_${bits}`
            case id_sha512WithRSAEncryption:
              return `C_RSA_SHA512_${bits}`
            case id_RSASSA_PSS:
              return `C_RSAPSS_SHA2_${bits}`
            default:
              throw new Error(
                `unsupported certificate signature algorithm: ${slave.signatureAlgorithm.algorithm}`,
              )
          }
        }

        /* ----------  ECDSA family  ---------------------------------------------- */
        function dispatcherForECDSA(slave: Certificate): string {
          const ecParameters = AsnConvert.parse(
            slave.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
            ECParameters,
          )

          // TODO: implement for brainpool
          // if (!ecParameters.specifiedCurve?.fieldID.parameters) {
          //   throw new TypeError('ECDSA public key does not have a fieldID parameters')
          // }

          // const fieldParameterHex = Buffer.from(
          //   ecParameters.specifiedCurve?.fieldID.parameters,
          // ).toString('hex')

          const bitLen = (tempEDoc.sod.x509SlaveCert.publicKey.rawData.byteLength * 8).toString()

          switch (slave.signatureAlgorithm.algorithm) {
            case id_ecdsaWithSHA1: // ECDSAwithSHA1
              return `C_ECDSA_${ecParameters.namedCurve}_SHA1_${bitLen}`
            case id_ecdsaWithSHA256: // ECDSAwithSHA256
              return `C_ECDSA_${ecParameters.namedCurve}_SHA2_${bitLen}`
            case id_ecdsaWithSHA384: // ECDSAwithSHA384
              return `C_ECDSA_${ecParameters.namedCurve}_SHA384_${bitLen}`
            case id_ecdsaWithSHA512: // ECDSAwithSHA512
              return `C_ECDSA_${ecParameters.namedCurve}_SHA512_${bitLen}`
            default:
              throw new Error(
                `unsupported certificate signature algorithm: ${slave.signatureAlgorithm}`,
              )
          }
        }
      })()

      const dispatcherHash = keccak256(Buffer.from(dispatcherName, 'utf-8'))

      const certificate: Registration2.CertificateStruct = {
        dataType: dispatcherHash,
        signedAttributes:
          '0x' +
          Buffer.from(AsnConvert.serialize(tempEDoc.sod.slaveCert.tbsCertificate)).toString('hex'),
        keyOffset: x509KeyOffset,
        expirationOffset: expOffset,
      }
      const icaoMember: Registration2.ICAOMemberStruct = {
        signature: '0x' + Buffer.from(icaoMemberSignature).toString('hex'),
        publicKey: '0x' + Buffer.from(icaoMemberKey).toString('hex'),
      }

      const icaoMerkleProofSiblings = inclusionProof.proof
        .allSiblings()
        .map(el => {
          return '0x' + el.hex()
        })
        .flat()

      return registrationContractInterface.encodeFunctionData('registerCertificate', [
        certificate,
        icaoMember,
        icaoMerkleProofSiblings,
      ])
    },
    [registrationContractInterface],
  )

  const registerCertificate = useCallback(
    async (CSCAs: Certificate[], tempEDoc: EDocument, slaveMaster: X509Certificate) => {
      try {
        const newCallData = await newBuildRegisterCertCallData(CSCAs, tempEDoc, slaveMaster)

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
    async (
      eDoc: EDocument,
      smtProof: SparseMerkleTree.ProofStructOutput,
      circuit: RegistrationCircuit,
    ) => {
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
          encapsulatedContent: padBitsToFixedBlocks(
            eDoc.sod.encapsulatedContent,
            circuit.ecChunkNumber,
            circuit.hashAlgorithm,
          ),
          signedAttributes: padBitsToFixedBlocks(
            eDoc.sod.signedAttributes,
            2,
            circuit.hashAlgorithm,
          ),
          pubkey: (() => {
            return [0]
          })(),
          signature: (() => {
            return [0]
          })(),
          dg1: padBitsToFixedBlocks(eDoc.dg1Bytes, 2, circuit.hashAlgorithm),
          dg15: (() => {
            if (!eDoc.dg15Bytes || !circuit.dg15EcChunkNumber) {
              return []
            }

            return padBitsToFixedBlocks(
              eDoc.dg15Bytes,
              circuit.dg15EcChunkNumber,
              circuit.hashAlgorithm,
            )
          })(),
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
      circuitName: string,
    ) => {
      const aaSignature = identityItem.document.getAASignature()

      if (!aaSignature) throw new TypeError('AA signature is not defined')

      const parts = circuitName.split('_')

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
        circuit.circuitParams.name,
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
        zeroPadValue(tempEDoc.sod.slaveCertificateIndex, 32),
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

      const circuit = RegistrationCircuit.fromEDoc(revokedEDocument)

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

  const [tempCSCAs, setTempCSCAs] = useState<Certificate[]>()
  const [tempMaster, setTempMaster] = useState<X509Certificate>()

  const createIdentity = useCallback(
    async (
      tempEDoc: EDocument,
      opts: {
        onRevocation: (identityItem: IdentityItem) => void
      },
    ): Promise<IdentityItem> => {
      const [icaoBytes, getIcaoBytesError] = await tryCatch(
        (async () => {
          const icaoAsset = assets?.[0]

          if (!icaoAsset?.localUri) throw new TypeError('ICAO asset not found')
          const icaoBase64 = await FileSystem.readAsStringAsync(icaoAsset.localUri, {
            encoding: FileSystem.EncodingType.Base64,
          })

          return decodeBase64(icaoBase64)
        })(),
      )
      if (getIcaoBytesError) {
        throw new TypeError('Failed to get ICAO bytes', getIcaoBytesError)
      }

      const [CSCAs, error] = await tryCatch(
        (async () => {
          const pemObjects = forge.pem.decode(Buffer.from(icaoBytes.buffer).toString('utf-8'))

          const pems = pemObjects.map(el => forge.pem.encode(el))

          return pems.map(el => {
            const der = forge.pki.pemToDer(el)
            return AsnConvert.parse(Buffer.from(der.toHex(), 'hex'), Certificate)
          })
        })(),
      )
      if (error) {
        throw new TypeError('Failed to parse ICAO CMS', error)
      }
      if (!tempCSCAs) {
        setTempCSCAs(CSCAs)
      }

      const [slaveMaster, getSlaveMasterError] = await tryCatch(
        (async () => {
          if (tempMaster) return tempMaster

          return tempEDoc.sod.getSlaveMaster(CSCAs)
        })(),
      )
      if (getSlaveMasterError) {
        throw new TypeError('Failed to get master certificate', getSlaveMasterError)
      }
      if (!tempMaster) {
        setTempMaster(slaveMaster)
      }

      const [slaveCertSmtProof, getSlaveCertSmtProofError] = await tryCatch(
        getSlaveCertSmtProof(tempEDoc),
      )
      if (getSlaveCertSmtProofError) {
        throw new TypeError('Slave certificate SMT proof not found', getSlaveCertSmtProofError)
      }

      if (!slaveCertSmtProof.existence) {
        const [, registerCertificateError] = await tryCatch(
          registerCertificate(CSCAs, tempEDoc, slaveMaster),
        )
        if (registerCertificateError) {
          ErrorHandler.processWithoutFeedback(registerCertificateError)

          if (!(registerCertificateError instanceof CertificateAlreadyRegisteredError)) {
            throw new TypeError('Failed to register slave certificate', registerCertificateError)
          }
        }
      }

      const registrationCircuit = RegistrationCircuit.fromEDoc(tempEDoc)

      const [regProof, getRegProofError] = await tryCatch(
        getIdentityRegProof(tempEDoc, slaveCertSmtProof, registrationCircuit),
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
      assets,
      getIdentityRegProof,
      getSlaveCertSmtProof,
      registerCertificate,
      registerIdentity,
      tempCSCAs,
      tempMaster,
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
