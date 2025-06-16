import { time } from '@distributedlab/tools'
import { InMemoryDB, Merkletree, str2Bytes } from '@iden3/js-merkletree'
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
  id_secp192r1,
  id_secp224r1,
  id_secp256r1,
  id_secp384r1,
  id_secp521r1,
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
import { useCallback, useMemo, useRef } from 'react'

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

import { useCircuit } from './circuit'

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

  const makeIcaoTree = async (pems: Uint8Array[]): Promise<Merkletree> => {
    const db = new InMemoryDB(str2Bytes('ICAO-TREE'))
    const mt = new Merkletree(db, true, 10) // depth=10 is enough for <2^10 certs
    await Promise.all(
      pems.map(async (pem, i) => {
        const h = BigInt(keccak256(pem))
        await mt.add(BigInt(i), h)
      }),
    )
    return mt
  }

  const newBuildRegisterCertCallData = useCallback(
    async (icaoBytes: Uint8Array, tempEDoc: NewEDocument, slaveMaster: Certificate) => {
      const x509SlaveCert = new X509.X509Certificate(tempEDoc.sod.slaveCertPemBytes)
      const x509MasterCert = new X509.X509Certificate(AsnConvert.serialize(slaveMaster))

      const masterCertificatesPem = parseIcaoCms(icaoBytes)

      const icaoTree = await makeIcaoTree(
        masterCertificatesPem.map(el => new Uint8Array(AsnConvert.serialize(el))),
      )

      const { proof: inclusionProof } = await icaoTree.generateProof(
        BigInt(Buffer.from(AsnConvert.serialize(slaveMaster)).toString('hex')),
      )

      if (inclusionProof.allSiblings().length <= 0) {
        throw new TypeError('failed to generate inclusion proof')
      }

      const icaoMemberSignature = (() => {
        if (x509SlaveCert.publicKey.algorithm.name === id_rsaEncryption) {
          return new Uint8Array(x509SlaveCert.signature)
        }

        if (x509SlaveCert.publicKey.algorithm.name === id_ecdsaWithSHA1) {
          return normalizeSignatureWithCurve(
            new Uint8Array(x509SlaveCert.publicKey.rawData),
            x509SlaveCert.publicKey.algorithm.name,
          )
        }

        throw new TypeError(
          `Unsupported public key algorithm: ${x509SlaveCert.publicKey.algorithm.name}`,
        )
      })()

      const icaoMemberKey = (() => {
        if (x509SlaveCert.publicKey.algorithm.name === id_rsaEncryption) {
          const pub = AsnConvert.parse(x509SlaveCert.publicKey.rawData, RSAPublicKey)

          return new Uint8Array(pub.modulus)
        }

        if (x509SlaveCert.publicKey.algorithm.name === id_ecdsaWithSHA1) {
          const ecParameters = AsnConvert.parse(x509SlaveCert.publicKey.rawData, ECParameters)

          if (!ecParameters.namedCurve) {
            throw new TypeError('ECDSA public key does not have a named curve')
          }

          const hexKey = Buffer.from(x509SlaveCert.publicKey.rawData).toString('hex')
          const ec = new EC(ecParameters.namedCurve)
          const key = ec.keyFromPublic(hexKey, 'hex')
          const point = key.getPublic()

          const byteLength = Math.ceil(ec.curve.n.bitLength() / 8)

          const x = getBytes(zeroPadValue('0x' + point.getX().toString('hex'), byteLength))
          const y = getBytes(zeroPadValue('0x' + point.getY().toString('hex'), byteLength))

          return new Uint8Array([...x, ...y])
        }

        throw new TypeError(
          `Unsupported public key algorithm: ${x509SlaveCert.publicKey.algorithm.name}`,
        )
      })()

      const x509KeyOffset = (() => {
        let pub: Uint8Array = new Uint8Array()

        if (x509SlaveCert.publicKey.algorithm.name === id_rsaEncryption) {
          const rsaPub = AsnConvert.parse(x509SlaveCert.publicKey.rawData, RSAPublicKey)

          pub = new Uint8Array(rsaPub.modulus)
        }

        if (x509SlaveCert.publicKey.algorithm.name === id_ecdsaWithSHA1) {
          const ecParameters = AsnConvert.parse(x509SlaveCert.publicKey.rawData, ECParameters)

          if (!ecParameters.namedCurve) {
            throw new TypeError('ECDSA public key does not have a named curve')
          }

          const hexKey = Buffer.from(x509SlaveCert.publicKey.rawData).toString('hex')
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
            `Unsupported public key algorithm: ${x509SlaveCert.publicKey.algorithm.name}`,
          )
        }

        const index = Buffer.from(tempEDoc.sod.signedAttributes)
          .toString('hex')
          .indexOf(Buffer.from(pub).toString('hex'))

        return BigInt(index / 2) // index in bytes, not hex
      })()
      const expOffset = (() => {
        const expiration = x509SlaveCert.notAfter

        const expirationUTCTime = time(expiration).utc().format('YYMMDDHHmmssZ')

        const expirationUTCTimeBytes = Buffer.from(expirationUTCTime, 'utf-8')

        const index = Buffer.from(tempEDoc.sod.signedAttributes)
          .toString('hex')
          .indexOf(expirationUTCTimeBytes.toString('hex'))

        if (index < 0) {
          throw new TypeError('Expiration time not found in signed attributes')
        }

        return BigInt(index / 2) // index in bytes, not hex
      })()

      const { dispatcherHash } = (() => {
        interface DispatcherResult {
          dispatcherName: string // e.g. "C_RSA_SHA512_4096"
          dispatcherHash: Uint8Array // 32-byte Keccak-256
        }

        const masterKeyAlg = x509MasterCert.publicKey.algorithm.name.toUpperCase()

        switch (masterKeyAlg) {
          case 'RSA':
            return dispatcherForRSA(x509MasterCert, x509SlaveCert)
          case 'EC': // @peculiar/x509 uses "EC" for NIST/BP curves
            return dispatcherForECDSA(x509MasterCert, x509SlaveCert)
          default:
            throw new Error(`unsupported public key type: ${masterKeyAlg}`)
        }

        /* ----------  RSA family  ------------------------------------------------- */
        function dispatcherForRSA(
          _master: X509.X509Certificate,
          slave: X509.X509Certificate,
        ): DispatcherResult {
          if (slave.publicKey.algorithm.name.toUpperCase() !== 'RSA') {
            throw new Error('slave certificate is not RSA')
          }

          const slaveRSAPubKey = AsnConvert.parse(slave.publicKey.rawData, RSAPublicKey)

          const bits = (slaveRSAPubKey.modulus.byteLength * 8).toString() // size
          const sigOid = slave.signatureAlgorithm // OID

          let dispatcherName: string

          const hash = slave.signatureAlgorithm.hash.name ?? 'SHA256' // FIXME: what is this?
          switch (sigOid.hash.name) {
            case id_sha1WithRSAEncryption: // SHA1withRSA
              dispatcherName = `C_RSA_SHA1_${bits}`
              break
            case id_sha256WithRSAEncryption: // SHA256withRSA
              dispatcherName = `C_RSA_${bits}`
              break
            case id_sha384WithRSAEncryption: // SHA384withRSA
              dispatcherName = `C_RSA_SHA384_${bits}`
              break
            case id_sha512WithRSAEncryption: // SHA512withRSA
              dispatcherName = `C_RSA_SHA512_${bits}`
              break
            case id_RSASSA_PSS: // RSASSA-PSS
              // Peculiar parses PSS params; if absent we treat as SHA-256
              if (hash === 'SHA384') dispatcherName = `C_RSAPSS_SHA384_${bits}`
              else if (hash === 'SHA512') dispatcherName = `C_RSAPSS_SHA512_${bits}`
              else dispatcherName = `C_RSAPSS_SHA2_${bits}`
              break
            default:
              throw new Error(`unsupported certificate signature algorithm: ${sigOid}`)
          }

          return {
            dispatcherName,
            dispatcherHash: getBytes(keccak256(Buffer.from(dispatcherName, 'utf-8'))),
          }
        }

        /* ----------  ECDSA family  ---------------------------------------------- */
        function dispatcherForECDSA(
          master: X509.X509Certificate,
          slave: X509.X509Certificate,
        ): DispatcherResult {
          if (slave.publicKey.algorithm.name.toUpperCase() !== 'EC') {
            throw new Error('slave certificate is not EC')
          }

          const curveOid = master.publicKey.algorithm.name // Peculiar stores the OID
          const curveName = mapCurveOidToName(curveOid)

          const bitLen = (slave.publicKey.rawData.byteLength * 8).toString()
          const sigOid = slave.signatureAlgorithm

          let dispatcherName: string

          switch (sigOid.hash.name) {
            case id_ecdsaWithSHA1: // ECDSAwithSHA1
              dispatcherName = `C_ECDSA_${curveName}_SHA1_${bitLen}`
              break
            case id_ecdsaWithSHA256: // ECDSAwithSHA256
              dispatcherName = `C_ECDSA_${curveName}_SHA2_${bitLen}`
              break
            case id_ecdsaWithSHA384: // ECDSAwithSHA384
              dispatcherName = `C_ECDSA_${curveName}_SHA384_${bitLen}`
              break
            case id_ecdsaWithSHA512: // ECDSAwithSHA512
              dispatcherName = `C_ECDSA_${curveName}_SHA512_${bitLen}`
              break
            default:
              throw new Error(`unsupported certificate signature algorithm: ${sigOid}`)
          }

          return {
            dispatcherName,
            dispatcherHash: getBytes(keccak256(Buffer.from(dispatcherName, 'utf-8'))),
          }
        }

        /* ----------  Curve OID → dispatcher suffix  ----------------------------- */
        /*
          | OID                     | Curve name                                         | Arc explanation                                                                                                           |
          | ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
          | **1.2.840.10045.3.1.6** | SECP160R1 (P-160)                                  | `1.2.840` = US ANSI; `10045` = X9.62; `3.1` = prime curves; `6` = 160-bit curve ([alvestrand.no][1], [neuromancer.sk][2]) |
          | **1.2.840.10045.3.1.1** | SECP192R1 (P-192) ([oid-base.com][3])              |                                                                                                                           |
          | **1.2.840.10045.3.1.7** | SECP256R1 (P-256 / prime256v1) ([oid-base.com][4]) |                                                                                                                           |

          [1]: https://www.alvestrand.no/objectid/1.2.840.10045.3.1.7.html?utm_source=chatgpt.com "1.2.840.10045.3.1.7 - \"SEC 2\" recommended elliptic curve domain"
          [2]: https://neuromancer.sk/std/brainpool/brainpoolP160r1/?utm_source=chatgpt.com "brainpoolP160r1 | Standard curve database - neuromancer.sk"
          [3]: https://oid-base.com/get/1.2.840.10045.3.1.1?utm_source=chatgpt.com "1.2.840.10045.3.1.1 = {iso(1) member-body(2) us ... - OID repository"
          [4]: https://oid-base.com/get/1.2.840.10045.3.1.7?utm_source=chatgpt.com "1.2.840.10045.3.1.7 = {iso(1) member-body(2) us ... - OID repository"
         */
        /*
          | OID       | Curve name      | RFC                                               |
          | --------- | --------------- | ------------------------------------------------- |
          | **… .1**  | brainpoolP160R1 | 5639 ([oidref.com][1], [neuromancer.sk][2])       |
          | **… .3**  | brainpoolP192R1 | 5639 ([oidref.com][1], [datatracker.ietf.org][3]) |
          | **… .5**  | brainpoolP224R1 | 5639 ([oidref.com][1])                            |
          | **… .7**  | brainpoolP256R1 | 5639 ([oidref.com][1])                            |
          | **… .11** | brainpoolP384R1 | 5639 ([oid-base.com][4])                          |
          | **… .13** | brainpoolP512R1 | 5639 ([oid-base.com][5])                          |

          [1]: https://oidref.com/1.3.36.3.3.2.8.1.1.7?utm_source=chatgpt.com "OID 1.3.36.3.3.2.8.1.1.7 brainpoolP256r1 reference info"
          [2]: https://neuromancer.sk/std/brainpool/brainpoolP160r1/?utm_source=chatgpt.com "brainpoolP160r1 | Standard curve database - neuromancer.sk"
          [3]: https://datatracker.ietf.org/doc/html/rfc5639?utm_source=chatgpt.com "RFC 5639 - Elliptic Curve Cryptography (ECC) Brainpool Standard ..."
          [4]: https://oid-base.com/get/1.3.36.3.3.2.8.1.1.11?utm_source=chatgpt.com "brainpoolP384r1(11) - OID repository"
          [5]: https://oid-base.com/get/1.3.36.3.3.2.8.1.1.13?utm_source=chatgpt.com "brainpoolP512r1(13) - OID repository"
        */
        function mapCurveOidToName(oid: string): string {
          switch (oid) {
            case '1.2.840.10045.3.1.6':
              return 'SECP160R1' // P-160
            case id_secp192r1:
              return 'SECP192R1' // P-192
            case id_secp224r1:
              return 'SECP224R1' // P-224
            case id_secp256r1:
              return 'SECP256R1' // P-256
            case id_secp384r1:
              return 'SECP384R1' // P-384
            case id_secp521r1:
              return 'SECP521R1' // P-521
            case '1.3.36.3.3.2.8.1.1.1':
              return 'BRAINPOOLP160R1'
            case '1.3.36.3.3.2.8.1.1.3':
              return 'BRAINPOOLP192R1'
            case '1.3.36.3.3.2.8.1.1.5':
              return 'BRAINPOOLP224R1'
            case '1.3.36.3.3.2.8.1.1.7':
              return 'BRAINPOOLP256R1'
            case '1.3.36.3.3.2.8.1.1.11':
              return 'BRAINPOOLP384R1'
            case '1.3.36.3.3.2.8.1.1.13':
              return 'BRAINPOOLP512R1'
            default:
              throw new Error(`unsupported curve OID: ${oid}`)
          }
        }
      })()

      const certificate: Registration2.CertificateStruct = {
        dataType: dispatcherHash,
        signedAttributes: tempEDoc.sod.signedAttributes,
        keyOffset: x509KeyOffset,
        expirationOffset: expOffset,
      }
      const icaoMember: Registration2.ICAOMemberStruct = {
        signature: Buffer.from(icaoMemberSignature).toString('hex'),
        publicKey: Buffer.from(icaoMemberKey).toString('hex'),
      }

      const icaoMerkleProofSiblings = inclusionProof
        .allSiblings()
        .map(el => {
          return el.bytes
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
    async (icaoBytes: Uint8Array, tempEDoc: NewEDocument, slaveMaster: Certificate) => {
      try {
        const newCallData = await newBuildRegisterCertCallData(icaoBytes, tempEDoc, slaveMaster)

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

  const createIdentity = useCallback(
    async (
      tempEDoc: NewEDocument,
      opts: {
        onRevocation: (identityItem: IdentityItem) => void
      },
    ): Promise<IdentityItem> => {
      const icaoAsset = assets?.[0]

      // TODO: check slave cert pem against icao bytes
      if (!icaoAsset?.localUri) throw new TypeError('ICAO asset not found')
      const icaoBase64 = await FileSystem.readAsStringAsync(icaoAsset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const icaoBytes = decodeBase64(icaoBase64)

      const [slaveMaster, getSlaveMasterError] = await tryCatch(
        (async () => tempEDoc.sod.getSlaveMaster(icaoBytes))(),
      )
      if (getSlaveMasterError) {
        throw new TypeError('Failed to get master certificate', getSlaveMasterError)
      }

      const circuitType = getCircuitType(tempEDoc.sod.X509RSASize)

      if (!circuitType) throw new TypeError('Unsupported public key size')

      const [slaveCertSmtProof, getSlaveCertSmtProofError] = await tryCatch(
        getSlaveCertSmtProof(tempEDoc),
      )
      if (getSlaveCertSmtProofError) {
        throw new TypeError('Slave certificate SMT proof not found', getSlaveCertSmtProofError)
      }

      if (!slaveCertSmtProof.existence) {
        const [, registerCertificateError] = await tryCatch(
          registerCertificate(icaoBytes, tempEDoc, slaveMaster),
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
