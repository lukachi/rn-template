import { time } from '@distributedlab/tools'
import { InMemoryDB, Merkletree } from '@iden3/js-merkletree'
import {
  CircuitType,
  getCircuitDetailsByType,
  getCircuitType,
  scanDocument,
} from '@modules/e-document'
import {
  NewEDocument,
  normalizeSignatureWithCurve,
} from '@modules/e-document/src/helpers/e-document'
import { parseIcaoCms } from '@modules/e-document/src/helpers/sod'
import { groth16ProveWithZKeyFilePath, ZKProof } from '@modules/rapidsnark-wrp'
import { buildRegisterIdentityInputs } from '@modules/rarime-sdk'
import {
  ECParameters,
  id_ecdsaWithSHA1,
  id_ecdsaWithSHA256,
  id_ecdsaWithSHA384,
  id_ecdsaWithSHA512,
} from '@peculiar/asn1-ecc'
import {
  id_rsaEncryption,
  id_RSASSA_PSS,
  id_sha1WithRSAEncryption,
  id_sha256WithRSAEncryption,
  id_sha384WithRSAEncryption,
  id_sha512WithRSAEncryption,
  RSAPublicKey,
} from '@peculiar/asn1-rsa'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import * as X509 from '@peculiar/x509'
import { AxiosError } from 'axios'
import { ec as EC } from 'elliptic'
import {
  decodeBase64,
  encodeBase64,
  ethers,
  getBytes,
  JsonRpcProvider,
  keccak256,
  zeroPadValue,
} from 'ethers'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { FieldRecords } from 'mrz'
import { useCallback, useMemo, useRef, useState } from 'react'
import SuperJSON from 'superjson'

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

import { useCircuit } from '../circuit'

const ZERO_BYTES32_HEX = ethers.encodeBytes32String('')

type PassportInfo = {
  passportInfo_: StateKeeper.PassportInfoStructOutput
  identityInfo_: StateKeeper.IdentityInfoStructOutput
}

export class NeedRevocationError extends Error {
  constructor(message: string, cause?: Error) {
    super(message)
    this.name = 'NeedRevocationError'
    this.cause = cause
  }
}

export const useRegistration = () => {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)
  const publicKeyHash = walletStore.usePublicKeyHash()

  const { loadCircuit, ...circuitLoadingDetails } = useCircuit()

  const [assets] = useAssets([require('@assets/certificates/ICAO.pem')])

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
    async (CSCAs: Certificate[], tempEDoc: NewEDocument, slaveMaster: Certificate) => {
      // priority = keccak256.Hash(key) % (2^64-1)
      function toField(bytes: Uint8Array): bigint {
        const bi = BigInt('0x' + Buffer.from(bytes).toString('hex'))
        return bi % (2n ** 64n - 1n)
      }

      const x509MasterCert = new X509.X509Certificate(AsnConvert.serialize(slaveMaster))

      const [icaoTree, getIcaoTreeError] = await tryCatch(
        (async () => {
          const db = new InMemoryDB(new Uint8Array([0])) // arbitrary prefix
          const tree = new Merkletree(db, true, 256)

          for (const cert of CSCAs) {
            const digest = keccak256(
              new Uint8Array(cert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
            ) // TODO: check for prefixes
            const key = toField(getBytes(digest)) // inside the field

            await tryCatch(tree.add(key, 0n)) // TODO: check this
          }

          return tree
        })(),
      )
      if (getIcaoTreeError) {
        throw new TypeError(`Failed to create ICAO Merkle tree: ${getIcaoTreeError}`)
      }

      const [inclusionProof, getInclusionProofError] = await tryCatch(
        (async () => {
          const leafDigest = keccak256(
            new Uint8Array(slaveMaster.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
          )
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

      const icaoMemberSignature = (() => {
        if (
          tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm ===
          id_rsaEncryption
        ) {
          return new Uint8Array(tempEDoc.sod.slaveCert.signatureValue)
        }

        if (
          tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm ===
          id_ecdsaWithSHA1
        ) {
          return normalizeSignatureWithCurve(
            new Uint8Array(tempEDoc.sod.slaveCert.signatureValue),
            'x509SlaveCert.publicKey.algorithm.name', // FIXME: need ec name
          )
        }

        throw new TypeError(
          `Unsupported public key algorithm: ${tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm}`,
        )
      })()

      const icaoMemberKey = (() => {
        if (
          tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm ===
          id_rsaEncryption
        ) {
          const pub = AsnConvert.parse(
            tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
            RSAPublicKey,
          )

          return new Uint8Array(pub.modulus)
        }

        if (
          tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm ===
          id_ecdsaWithSHA1
        ) {
          const ecParameters = AsnConvert.parse(
            tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
            ECParameters,
          )

          if (!ecParameters.namedCurve) {
            throw new TypeError('ECDSA public key does not have a named curve')
          }

          const hexKey = Buffer.from(
            tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
          ).toString('hex')

          const ec = new EC(ecParameters.namedCurve)
          const key = ec.keyFromPublic(hexKey, 'hex')
          const point = key.getPublic()

          const byteLength = Math.ceil(ec.curve.n.bitLength() / 8)

          const x = getBytes(zeroPadValue('0x' + point.getX().toString('hex'), byteLength))
          const y = getBytes(zeroPadValue('0x' + point.getY().toString('hex'), byteLength))

          return new Uint8Array([...x, ...y])
        }

        throw new TypeError(
          `Unsupported public key algorithm: ${tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm}`,
        )
      })()

      const x509KeyOffset = (() => {
        let pub: Uint8Array = new Uint8Array()

        if (
          tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm ===
          id_rsaEncryption
        ) {
          const rsaPub = AsnConvert.parse(
            tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
            RSAPublicKey,
          )

          pub = new Uint8Array(rsaPub.modulus)
        }

        if (
          tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm ===
          id_ecdsaWithSHA1
        ) {
          const ecParameters = AsnConvert.parse(
            tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
            ECParameters,
          )

          if (!ecParameters.namedCurve) {
            throw new TypeError('ECDSA public key does not have a named curve')
          }

          const hexKey = Buffer.from(
            tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
          ).toString('hex')
          const ec = new EC(ecParameters.namedCurve)
          const key = ec.keyFromPublic(hexKey, 'hex')
          const point = key.getPublic()

          const byteLength = Math.ceil(ec.curve.n.bitLength() / 8)

          pub = new Uint8Array([
            ...getBytes(zeroPadValue('0x' + point.getX().toString('hex'), byteLength)),
            ...getBytes(zeroPadValue('0x' + point.getY().toString('hex'), byteLength)),
          ])
        }

        if (!pub.length) {
          throw new TypeError(
            `Unsupported public key algorithm: ${tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm}`,
          )
        }

        const index = Buffer.from(AsnConvert.serialize(tempEDoc.sod.slaveCert.tbsCertificate))
          .toString('hex')
          .indexOf(Buffer.from(pub).toString('hex'))

        if (index === -1) {
          throw new TypeError('Public key not found in TBS Certificate')
        }

        return BigInt(index / 2) // index in bytes, not hex
      })()

      const expOffset = (() => {
        const tbsCertificateHex = Buffer.from(
          AsnConvert.serialize(tempEDoc.sod.slaveCert.tbsCertificate),
        ).toString('hex')

        if (!tempEDoc.sod.slaveCert.tbsCertificate.validity.notAfter.utcTime)
          throw new TypeError('Expiration time not found in TBS Certificate')

        const expirationHex = Buffer.from(
          time(tempEDoc.sod.slaveCert.tbsCertificate.validity.notAfter.utcTime?.toISOString())
            .utc()
            .format('YYMMDDHHmmss[Z]'),
          'utf-8',
        ).toString('hex')

        const index = tbsCertificateHex.indexOf(expirationHex)

        if (index < 0) {
          throw new TypeError('Expiration time not found in TBS Certificate')
        }

        return BigInt(index / 2) // index in bytes, not hex
      })()

      const x509SlaveCert = new X509.X509Certificate(tempEDoc.sod.slaveCertPemBytes)

      const dispatcherName = (() => {
        const masterKeyAlg = x509MasterCert.publicKey.algorithm.name.toUpperCase()

        switch (tempEDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm) {
          case id_rsaEncryption:
            return dispatcherForRSA(tempEDoc.sod.slaveCert)
          case id_ecdsaWithSHA1:
            return dispatcherForECDSA(tempEDoc.sod.slaveCert)
          default:
            throw new Error(`unsupported public key type: ${masterKeyAlg}`)
        }

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

          const bitLen = (x509SlaveCert.publicKey.rawData.byteLength * 8).toString()

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
    async (CSCAs: Certificate[], tempEDoc: NewEDocument, slaveMaster: Certificate) => {
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
      eDoc: NewEDocument,
      circuitType: CircuitType,
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
        pubKeyPem: eDoc.sod.publicKeyPemBytes,
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
      identityItem: IdentityItem,
      masterCertSmtProofRoot: Uint8Array,
      circuitTypeCertificatePubKeySize: number,
      isRevoked: boolean,
      circuitName: string,
    ) => {
      const parts = circuitName.split('_')

      if (parts.length < 2) {
        throw new Error('circuit name is in invalid format')
      }

      // ZKTypePrefix represerts the circuit zk type prefix
      const ZKTypePrefix = 'Z_PER_PASSPORT'

      const zkTypeSuffix = parts.slice(1).join('_') // support for multi-underscore suffix
      const zkTypeName = `${ZKTypePrefix}_${zkTypeSuffix}`

      const passport: Registration2.PassportStruct = {
        dataType: identityItem.document.getAADataType(circuitTypeCertificatePubKeySize),
        zkType: keccak256(zkTypeName),
        signature: identityItem.document.AASignature,
        publicKey:
          identityItem.document.AAPublicKey === null
            ? identityItem.passportKey
            : identityItem.document.AAPublicKey,
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
          masterCertSmtProofRoot,
          identityItem.pkIdentityHash,
          identityItem.dg1Commitment,
          passport,
          proofPoints,
        ])
      }

      return registrationContractInterface.encodeFunctionData('register', [
        masterCertSmtProofRoot,
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
      masterCertSmtProofRoot: Uint8Array,
      circuitTypeCertificatePubKeySize: number,
      isRevoked: boolean,
    ) => {
      const registerCallData = newBuildRegisterCallData(
        identityItem,
        masterCertSmtProofRoot,
        circuitTypeCertificatePubKeySize,
        isRevoked,
        '0', // TODO circuitName has to be built
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
          identityItem,
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
    async (tempEDoc: NewEDocument) => {
      return certPoseidonSMTContract.contractInstance.getProof(
        zeroPadValue(tempEDoc.sod.slaveCertificateIndex, 32),
      )
    },
    [certPoseidonSMTContract.contractInstance],
  )

  const resolveRevokedEDocument =
    useRef<(value: NewEDocument | PromiseLike<NewEDocument>) => void>()
  const rejectRevokedEDocument = useRef<(reason?: unknown) => void>()

  const revokeIdentity = useCallback(
    async (
      tempMRZ: FieldRecords,
      currentIdentityItem: IdentityItem,
      _passportInfo?: PassportInfo | null,
      _slaveCertSmtProof?: SparseMerkleTree.ProofStructOutput,
      _circuitType?: CircuitType,
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

      const circuitType =
        _circuitType ?? getCircuitType(currentIdentityItem.document.sod.X509RSASize)

      if (!circuitType) throw new TypeError('Unsupported public key size')

      const { circuitTypeCertificatePubKeySize } = getCircuitDetailsByType(circuitType)

      const [passportInfo, getPassportInfoError] = await (async () => {
        if (_passportInfo) return [_passportInfo, null]

        return tryCatch(currentIdentityItem.getPassportInfo())
      })()
      if (getPassportInfoError) {
        throw new TypeError('Failed to get passport info', getPassportInfoError)
      }

      if (!passportInfo?.passportInfo_.activeIdentity)
        throw new TypeError('Active identity not found')

      const isPassportRegistered = passportInfo?.passportInfo_.activeIdentity !== ZERO_BYTES32_HEX

      if (isPassportRegistered) {
        const passport: Registration2.PassportStruct = {
          dataType: revokedEDocument.getAADataType(circuitTypeCertificatePubKeySize),
          zkType: ZERO_BYTES32_HEX,
          signature: revokedEDocument.AASignature,
          publicKey: revokedEDocument.AAPublicKey || ZERO_BYTES32_HEX,
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

      await requestRelayerRegisterMethod(
        currentIdentityItem,
        getBytes(slaveCertSmtProof.root),
        circuitTypeCertificatePubKeySize,
        true,
      )
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
  const [tempMaster, setTempMaster] = useState<Certificate>()

  const createIdentity = useCallback(
    async (
      tempEDoc: NewEDocument,
      opts: {
        onRevocation: (identityItem: IdentityItem) => void
      },
    ): Promise<IdentityItem> => {
      const [icaoBytes, getIcaoBytesError] = await tryCatch(
        (async () => {
          const icaoAsset = assets?.[0]

          // TODO: check slave cert pem against icao bytes
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

      const CSCAs = tempCSCAs ?? parseIcaoCms(icaoBytes)
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

      const circuitType = getCircuitType(tempEDoc.sod.X509RSASize)

      if (!circuitType) throw new TypeError('Unsupported public key size')

      const [slaveCertSmtProof, getSlaveCertSmtProofError] = await tryCatch(
        getSlaveCertSmtProof(tempEDoc),
      )
      if (getSlaveCertSmtProofError) {
        throw new TypeError('Slave certificate SMT proof not found', getSlaveCertSmtProofError)
      }

      const [registerCertCallData, getRegisterCertCallDataError] = await tryCatch(
        newBuildRegisterCertCallData(CSCAs, tempEDoc, slaveMaster),
      )
      if (getRegisterCertCallDataError) {
        console.log(SuperJSON.stringify(getRegisterCertCallDataError))
        throw new TypeError(
          'Failed to build register certificate call data',
          getRegisterCertCallDataError,
        )
      }

      console.log({ registerCertCallData })

      throw new TypeError('purpose')

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

      const [regProof, getRegProofError] = await tryCatch(
        getIdentityRegProof(tempEDoc, circuitType, slaveCertSmtProof),
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
        registerIdentity(identityItem, slaveCertSmtProof, circuitType, passportInfo),
      )
      if (registerIdentityError) {
        opts?.onRevocation?.(identityItem)
        throw new NeedRevocationError(
          'Failed to register identity, revocation required',
          registerIdentityError,
        )
      }

      return identityItem
    },
    [assets, getIdentityRegProof, getSlaveCertSmtProof, registerCertificate, registerIdentity],
  )

  return {
    circuitLoadingDetails,
    resolveRevokedEDocument,
    rejectRevokedEDocument,

    revokeIdentity,
    createIdentity,
    getRevocationChallenge,
  }
}
