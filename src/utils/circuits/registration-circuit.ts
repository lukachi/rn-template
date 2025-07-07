import { Hex } from '@iden3/js-crypto'
import { ExternalCircuitParams } from '@modules/witnesscalculator'
import { secp256r1, secp521r1 } from '@noble/curves/nist'
import { ECDSASigValue, ECParameters } from '@peculiar/asn1-ecc'
import { RSAPublicKey, RsaSaPssParams } from '@peculiar/asn1-rsa'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { toBeArray, toBigInt } from 'ethers'

import { EDocument } from '@/utils/e-document/e-document'

import {
  brainpoolP256r1,
  brainpoolP320r1,
  brainpoolP384r1,
  brainpoolP512r1,
  secp192r1,
  secp224r1,
} from '../curves'
import { namedCurveFromParameters } from '../e-document/helpers/crypto'
import { extractPubKey } from '../e-document/helpers/misc'
import { CircuitDocumentType, HASH_ALGORITHMS } from './constants'
import { PrivateRegisterIdentityBuilderGroth16 } from './types/RegisterIdentityBuilder'

export class RegistrationCircuit {
  public prefixName = 'registerIdentity'

  get sigAttrHashType() {
    return this.eDoc.sod.signatures[0].digestAlgorithm
  }

  get dgHashType() {
    return this.eDoc.sod.ldsObject.algorithm
  }

  get docType() {
    switch (this.eDoc.docType) {
      case 'ID':
        return CircuitDocumentType.TD1
      case 'PASSPORT':
        return CircuitDocumentType.TD3
      default:
        return CircuitDocumentType.TD3
    }
  }

  get dg1Shift() {
    const hash = computeHash(this.dgHashType.algorithm, this.eDoc.dg1Bytes)

    return (
      Hex.encodeString(this.eDoc.sod.encapsulatedContent).split(Hex.encodeString(hash))[0].length /
      2
    )
  }

  get encapContentShift() {
    const hash = computeHash(this.sigAttrHashType.algorithm, this.eDoc.sod.encapsulatedContent)

    return (
      Hex.encodeString(this.eDoc.sod.signedAttributes).split(Hex.encodeString(hash))[0].length / 2
    )
  }

  get dg15Shift() {
    if (!this.eDoc.dg15Bytes) return 0

    const hash = computeHash(this.dgHashType.algorithm, this.eDoc.dg15Bytes)

    return (
      Hex.encodeString(this.eDoc.sod.encapsulatedContent).split(Hex.encodeString(hash))[0].length /
      2
    )
  }

  get chunkedParams() {
    return getChunkedParams(this.eDoc.sod.slaveCert)
  }

  get sigType() {
    const pubKey = extractPubKey(this.eDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo)
    const hashAlgLen = HASH_ALGORITHMS[this.sigAttrHashType.algorithm].len

    if (pubKey instanceof RSAPublicKey) {
      const exponent = toBigInt(new Uint8Array(pubKey.publicExponent)).toString(16)
      const unpaddedModulus = new Uint8Array(
        pubKey.modulus[0] === 0x00 ? pubKey.modulus.slice(1) : pubKey.modulus,
      )

      const unpaddedModulusHex = Hex.encodeString(unpaddedModulus)

      if (this.eDoc.sod.slaveCert.signatureAlgorithm.parameters) {
        const rsaSaPssParams = AsnConvert.parse(
          this.eDoc.sod.slaveCert.signatureAlgorithm.parameters,
          RsaSaPssParams,
        )

        if (
          unpaddedModulusHex.length === 512 &&
          exponent === '3' &&
          rsaSaPssParams.saltLength === 32 &&
          hashAlgLen === 32
        ) {
          return 10
        }

        if (
          unpaddedModulusHex.length === 512 &&
          exponent === '10001' &&
          rsaSaPssParams.saltLength === 32 &&
          hashAlgLen === 32
        ) {
          return 11
        }

        if (
          unpaddedModulusHex.length === 512 &&
          exponent === '10001' &&
          rsaSaPssParams.saltLength === 64 &&
          hashAlgLen === 32
        ) {
          return 12
        }

        if (
          unpaddedModulusHex.length === 512 &&
          exponent === '10001' &&
          rsaSaPssParams.saltLength === 48 &&
          hashAlgLen === 48
        ) {
          return 13
        }

        if (
          unpaddedModulusHex.length === 768 &&
          exponent === '10001' &&
          rsaSaPssParams.saltLength === 32 &&
          hashAlgLen === 32
        ) {
          return 14
        }
      }

      if (unpaddedModulusHex.length === 512 && exponent === '10001' && hashAlgLen === 32) {
        return 1
      }

      if (unpaddedModulusHex.length === 1024 && exponent === '10001' && hashAlgLen === 32) {
        return 2
      }

      if (unpaddedModulusHex.length === 512 && exponent === '10001' && hashAlgLen === 20) {
        return 3
      }

      return 0
    }

    if (!this.eDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters)
      throw new TypeError('ECDSA public key does not have parameters')

    const ecParameters = AsnConvert.parse(
      this.eDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
      ECParameters,
    )

    const [, namedCurve] = namedCurveFromParameters(
      ecParameters,
      new Uint8Array(this.eDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
    )

    if (!namedCurve) throw new TypeError('Named curve not found in TBS Certificate')

    switch (namedCurve.CURVE.a) {
      case brainpoolP256r1.CURVE.a:
        return 21
      case secp256r1.CURVE.a:
        return 20
      case secp224r1.CURVE.a:
        return 24
      case brainpoolP384r1.CURVE.a:
        return 25
      case brainpoolP512r1.CURVE.a:
        return 26
      case secp521r1.CURVE.a:
        return 27
      default:
        return 0
    }
  }

  get name(): string {
    const dgHashTypeLen = HASH_ALGORITHMS[this.dgHashType.algorithm].len
    const dgHashTypeLenBits = HASH_ALGORITHMS[this.dgHashType.algorithm].len * 8

    const ecChunkNumber =
      dgHashTypeLen <= 32
        ? Math.ceil((this.eDoc.sod.encapsulatedContent.length + 8) / 64)
        : Math.ceil((this.eDoc.sod.encapsulatedContent.length + 8) / 128)

    const encapContentShiftBits = this.encapContentShift * 8
    const dg1DigestPositionShiftBits = this.dg1Shift * 8

    const defaultNameParts = [
      this.prefixName,
      this.sigType,
      dgHashTypeLenBits,
      this.docType,
      ecChunkNumber,
      encapContentShiftBits,
      dg1DigestPositionShiftBits,
    ]

    if (!this.eDoc.dg15Bytes) {
      return [...defaultNameParts, 'NA'].join('_')
    }

    if (!this.eDoc.dg15PubKey) {
      throw new TypeError('dg15PubKey is not defined in EDocument')
    }

    const dg15PubKey = extractPubKey(this.eDoc.dg15PubKey)

    const aaSigType = (() => {
      if (dg15PubKey instanceof RSAPublicKey) {
        return 1
      }

      if (!this.eDoc.dg15PubKey.algorithm.parameters) {
        throw new TypeError('ECDSA public key does not have parameters')
      }

      const ecParameters = AsnConvert.parse(this.eDoc.dg15PubKey.algorithm.parameters, ECParameters)

      const [, namedCurve] = namedCurveFromParameters(
        ecParameters,
        new Uint8Array(
          this.eDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
        ),
      )

      if (!namedCurve) throw new TypeError('Named curve not found in TBS Certificate')

      switch (namedCurve.CURVE.a) {
        case brainpoolP256r1.CURVE.a:
          return 21
        case secp256r1.CURVE.a:
          return 20
        case brainpoolP320r1.CURVE.a:
          return 22
        case secp192r1.CURVE.a:
          return 23
        default:
          throw new TypeError('Unsupported named curve in dg15PubKey')
      }
    })()
    const aaShiftBytes = (() => {
      if (dg15PubKey instanceof RSAPublicKey) {
        const unpaddedModulus =
          dg15PubKey.modulus[0] === 0x00 ? dg15PubKey.modulus.slice(1) : dg15PubKey.modulus

        return (
          Hex.encodeString(this.eDoc.dg15Bytes).split(
            Hex.encodeString(new Uint8Array(unpaddedModulus)),
          )[0].length / 2
        )
      }

      return (
        Hex.encodeString(this.eDoc.dg15Bytes).split(Hex.encodeString(toBeArray(dg15PubKey.px)))[0]
          .length / 2
      )
    })()

    const dg15ShiftBits = this.dg15Shift * 8

    const dg15EcChunkNumber =
      dgHashTypeLen <= 32
        ? Math.ceil((this.eDoc.dg15Bytes.length + 8) / 64)
        : Math.ceil((this.eDoc.dg15Bytes.length + 8) / 128)

    return [
      ...defaultNameParts,
      aaSigType,
      dg15ShiftBits,
      dg15EcChunkNumber,
      aaShiftBytes * 8,
    ].join('_')
  }

  get circuitParams(): ExternalCircuitParams {
    return ExternalCircuitParams.fromName(this.name)
  }

  get keySize() {
    const pubKey = extractPubKey(this.eDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo)

    if (pubKey instanceof RSAPublicKey) {
      return (
        new Uint8Array(pubKey.modulus[0] === 0x00 ? pubKey.modulus.slice(1) : pubKey.modulus)
          .length * 8
      )
    }

    if (!this.eDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters) {
      throw new TypeError('ECDSA public key does not have parameters')
    }

    const ecParameters = AsnConvert.parse(
      this.eDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
      ECParameters,
    )

    const [, namedCurve] = namedCurveFromParameters(
      ecParameters,
      new Uint8Array(this.eDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
    )

    if (!namedCurve) throw new TypeError('Named curve not found in TBS Certificate')

    return toBeArray(namedCurve.CURVE.n).length * 8
  }

  constructor(public eDoc: EDocument) {}

  calcWtns(
    params: Pick<
      PrivateRegisterIdentityBuilderGroth16,
      'skIdentity' | 'slaveMerkleRoot' | 'slaveMerkleInclusionBranches'
    >,
    datBytes: Uint8Array,
  ): Promise<Uint8Array> {
    const inputs: PrivateRegisterIdentityBuilderGroth16 = {
      dg1: this.eDoc.dg1Bytes,
      dg15: this.eDoc.dg15Bytes,
      signedAttributes: this.eDoc.sod.signedAttributes,
      encapsulatedContent: this.eDoc.sod.encapsulatedContent,
      pubkey: extractPubKey(this.eDoc.sod.slaveCert.tbsCertificate.subjectPublicKeyInfo),
      signature: this.eDoc.sod.signature,
      skIdentity: params.skIdentity,
      slaveMerkleRoot: params.slaveMerkleRoot,
      slaveMerkleInclusionBranches: params.slaveMerkleInclusionBranches,
    }

    return this.circuitParams.wtnsCalcMethod(datBytes, Buffer.from(JSON.stringify(inputs)))
  }
}

const getChunkedParams = (certificate: Certificate) => {
  const pubKey = extractPubKey(certificate.tbsCertificate.subjectPublicKeyInfo)

  if (pubKey instanceof RSAPublicKey) {
    const ecFieldSize = 0
    const chunkSize = 64
    const chunkNumber = Math.ceil(pubKey.modulus.byteLength / 16)

    const publicKeyChunked = splitBigIntToChunks(
      chunkSize,
      chunkNumber,
      toBigInt(new Uint8Array(pubKey.modulus)),
    )

    const sigChunked = splitBigIntToChunks(
      chunkSize,
      chunkNumber,
      toBigInt(new Uint8Array(certificate.signatureValue)),
    )

    return {
      ec_field_size: ecFieldSize,
      chunk_number: chunkNumber,
      pk_chunked: publicKeyChunked,
      sig_chunked: sigChunked,
    }
  }

  // ECDSA public key handling

  if (!certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters?.byteLength) {
    throw new TypeError('ECDSA public key does not have parameters')
  }

  const ecFieldSize =
    certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters?.byteLength * 4

  const chunk_size = 66

  const chunkNumber = (() => {
    if (ecFieldSize <= 512) {
      return Math.ceil(toBeArray(pubKey.px).length / 16)
    }

    return 8
  })()

  const pk_chunked = splitBigIntToChunks(chunk_size, chunkNumber, pubKey.px).concat(
    splitBigIntToChunks(chunk_size, chunkNumber, pubKey.py),
  )

  const { r, s } = AsnConvert.parse(certificate.signatureValue, ECDSASigValue)

  // Convert r and s to BigInt directly without creating a Signature object
  const rBigInt = toBigInt(new Uint8Array(r))
  const sBigInt = toBigInt(new Uint8Array(s))

  const sig_chunked = splitBigIntToChunks(chunk_size, chunkNumber, rBigInt).concat(
    splitBigIntToChunks(chunk_size, chunkNumber, sBigInt),
  )

  return {
    ec_field_size: ecFieldSize,
    chunk_number: chunkNumber * 2, // bits
    pk_chunked: pk_chunked,
    sig_chunked: sig_chunked,
  }
}

const splitBigIntToChunks = (bitsPerChunk: number, chunkCount: number, value: bigint): string[] => {
  const mask = (1n << BigInt(bitsPerChunk)) - 1n
  return Array.from({ length: chunkCount }, (_, i) => {
    return ((value >> (BigInt(i) * BigInt(bitsPerChunk))) & mask).toString(10)
  })
}

function computeHash(outLen: string, input: Uint8Array) {
  const algorithm = HASH_ALGORITHMS[outLen]

  if (!algorithm) {
    throw new Error('Invalid hash output length. Use 20, 28, 32, 48, or 64 bytes.')
  }

  return algorithm.hasher(input)
}
