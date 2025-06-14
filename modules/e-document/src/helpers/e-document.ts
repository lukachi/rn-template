import { PersonDetails, toPem } from '@modules/e-document'
import { Sod } from './sod'
import superjson from 'superjson'
import { fromBER } from 'asn1js'
import { AsnConvert } from '@peculiar/asn1-schema'
import { SubjectPublicKeyInfo } from '@peculiar/asn1-x509'
import { decodeBase64, getBytes, keccak256, zeroPadValue } from 'ethers'
import { id_rsaEncryption, RSAPublicKey } from '@peculiar/asn1-rsa'
import { ECParameters, id_ecdsaWithSHA1 } from '@peculiar/asn1-ecc'
import { ec as EC } from 'elliptic'

import forge from 'node-forge'

type NewEDocumentSerialized = {
  docType: 'ID' | 'PASSPORT'
  personDetails: PersonDetails
  sodBytes: string
  dg1Bytes: string
  dg15Bytes: string
  dg11Bytes: string
  aaSignature: string
}

export class NewEDocument {
  static ECMaxSizeInBits = 2688 // Represents the maximum size in bits for an encapsulated content

  docType: 'ID' | 'PASSPORT'
  personDetails: PersonDetails
  sodBytes: Uint8Array
  dg1Bytes: Uint8Array
  dg15Bytes?: Uint8Array
  dg11Bytes?: Uint8Array
  aaSignature: Uint8Array // TODO: make optional and remove from persistence

  constructor(params: {
    docType: 'ID' | 'PASSPORT'
    personDetails: PersonDetails
    sodBytes: Uint8Array
    dg1Bytes: Uint8Array
    dg15Bytes?: Uint8Array
    dg11Bytes?: Uint8Array
    aaSignature: Uint8Array
  }) {
    this.docType = params.docType
    this.personDetails = params.personDetails
    this.sodBytes = params.sodBytes
    this.dg1Bytes = params.dg1Bytes
    this.dg15Bytes = params.dg15Bytes
    this.dg11Bytes = params.dg11Bytes
    this.aaSignature = params.aaSignature
  }

  get sod(): Sod {
    return new Sod(this.sodBytes)
  }

  serialize(): string {
    const serialized = superjson.stringify({
      docType: this.docType,
      personDetails: this.personDetails,
      sodBytes: Buffer.from(this.sodBytes).toString('base64'),
      dg1Bytes: Buffer.from(this.dg1Bytes).toString('base64'),
      dg15Bytes: this.dg15Bytes ? Buffer.from(this.dg15Bytes).toString('base64') : undefined,
      dg11Bytes: this.dg11Bytes ? Buffer.from(this.dg11Bytes).toString('base64') : undefined,
      aaSignature: Buffer.from(this.aaSignature).toString('base64'),
    })

    return serialized
  }

  static deserialize(serialized: string): NewEDocument {
    try {
      const parsed = superjson.parse<NewEDocumentSerialized>(serialized)

      const res = new NewEDocument({
        docType: parsed.docType,
        personDetails: parsed.personDetails,
        sodBytes: decodeBase64(parsed.sodBytes),
        dg1Bytes: decodeBase64(parsed.dg1Bytes),
        dg15Bytes: decodeBase64(parsed.dg15Bytes),
        dg11Bytes: decodeBase64(parsed.dg11Bytes),
        aaSignature: decodeBase64(parsed.aaSignature),
      })

      return res
    } catch (error) {
      console.error('Error during deserialization:', error)
      throw new Error('Failed to deserialize NewEDocument')
    }
  }

  get dg15PubKey() {
    if (!this.dg15Bytes) return undefined

    const { result } = fromBER(this.dg15Bytes)

    if (!result) {
      throw new Error('BER-decode failed - DG15 file corrupted?')
    }

    const subjectPublicKeyInfo = AsnConvert.parse(
      result.valueBlock.toBER(false),
      SubjectPublicKeyInfo,
    )

    return subjectPublicKeyInfo
  }

  get dg15PubKeyPem() {
    if (!this.dg15PubKey) return undefined

    return Buffer.from(toPem(AsnConvert.serialize(this.dg15PubKey), 'PUBLIC KEY'), 'utf8')
  }

  getAADataType(ecSizeInBits: number) {
    if (!this.dg15PubKey) {
      return getBytes(keccak256(Buffer.from('P_NO_DATA', 'utf-8')))
    }

    if (this.dg15PubKey?.algorithm.algorithm === id_rsaEncryption) {
      const rsaPubKey = AsnConvert.parse(this.dg15PubKey.subjectPublicKey, RSAPublicKey)

      const hashAlg = figureOutRSAAAHashAlgorithm(rsaPubKey, this.aaSignature)

      if (!hashAlg) {
        return getBytes(keccak256(Buffer.from('P_NO_DATA', 'utf-8')))
      }

      const exponentHex = Buffer.from(rsaPubKey.publicExponent).toString('hex')

      const e = new forge.jsbn.BigInteger(exponentHex, 16)

      const dispatcherName = `P_RSA_${hashAlg}_${NewEDocument.ECMaxSizeInBits > ecSizeInBits ? NewEDocument.ECMaxSizeInBits : ecSizeInBits}`
      if (e.intValue() === 3) {
        dispatcherName.concat('_3')
      }

      return getBytes(keccak256(Buffer.from(dispatcherName, 'utf-8')))
    }

    if (this.dg15PubKey?.algorithm.algorithm === id_ecdsaWithSHA1) {
      const dispatcherName = `P_ECDSA_SHA1_${ecSizeInBits}`

      return getBytes(keccak256(Buffer.from(dispatcherName, 'utf-8')))
    }

    throw new TypeError('Unsupported DG15 public key algorithm')
  }

  get AASignature() {
    if (!this.dg15PubKeyPem) {
      return new Uint8Array()
    }

    if (this.dg15PubKey?.algorithm.algorithm === id_rsaEncryption) {
      return this.aaSignature
    }

    if (this.dg15PubKey?.algorithm.algorithm === id_ecdsaWithSHA1) {
      const ecParameters = AsnConvert.parse(this.dg15PubKey.subjectPublicKey, ECParameters)

      // TODO: not tested yet
      if (!ecParameters.namedCurve) {
        throw new TypeError('ECDSA public key does not have a named curve')
      }

      return normalizeSignatureWithCurve(this.aaSignature, ecParameters.namedCurve)
    }

    throw new TypeError('Unsupported DG15 public key algorithm for AA signature extraction')
  }

  get AAPublicKey() {
    if (!this.dg15PubKeyPem) {
      return new Uint8Array()
    }

    if (this.dg15PubKey?.algorithm.algorithm === id_rsaEncryption) {
      const rsaPubKey = AsnConvert.parse(this.dg15PubKey.subjectPublicKey, RSAPublicKey)

      const hashAlg = figureOutRSAAAHashAlgorithm(rsaPubKey, this.aaSignature)

      if (!hashAlg) {
        return null
      }

      return new Uint8Array(rsaPubKey.modulus)
    }

    // TODO: not tested yet
    if (this.dg15PubKey?.algorithm.algorithm === id_ecdsaWithSHA1) {
      const ecParameters = AsnConvert.parse(this.dg15PubKey.subjectPublicKey, ECParameters)
      if (!ecParameters.namedCurve) {
        throw new TypeError('ECDSA public key does not have a named curve')
      }

      const hexKey = Buffer.from(this.dg15PubKey.subjectPublicKey).toString('hex')
      const ec = new EC(ecParameters.namedCurve) // TODO: derive curve name from ECParameters
      const key = ec.keyFromPublic(hexKey, 'hex')

      const point = key.getPublic()

      // Fixed-length padded X and Y coordinates
      const byteLength = Math.ceil(ec.curve.n.bitLength() / 8)

      const x = getBytes(zeroPadValue('0x' + point.getX().toString('hex'), byteLength))
      const y = getBytes(zeroPadValue('0x' + point.getY().toString('hex'), byteLength))

      return new Uint8Array([...x, ...y])
    }

    throw new TypeError('Unsupported DG15 public key algorithm for AA public key extraction')
  }
}

/**
 * Decrypts the AA signature using RSA public key and returns the inferred hash algorithm.
 * @param aaPubKey - RSAPublicKey object with modulus and publicExponent.
 * @param aaSignature - Signature to be decrypted (Uint8Array or Buffer).
 * @returns Hash algorithm name string (e.g., 'SHA256') or throws if invalid.
 */
export function figureOutRSAAAHashAlgorithm(
  aaPubKey: RSAPublicKey,
  aaSignature: Uint8Array,
): string | null {
  // Convert RSA modulus and exponent to BigIntegers
  const modulusHex = Buffer.from(aaPubKey.modulus).toString('hex')
  const exponentHex = Buffer.from(aaPubKey.publicExponent).toString('hex')

  const n = new forge.jsbn.BigInteger(modulusHex, 16)
  const e = new forge.jsbn.BigInteger(exponentHex, 16)

  // Convert signature to BigInteger
  const sigBigInt = new forge.jsbn.BigInteger(Buffer.from(aaSignature).toString('hex'), 16)

  // Decrypt: m = sig^e mod n
  let decryptedBytes = Buffer.from(sigBigInt.modPow(e, n).toByteArray())

  // Remove leading 0x00 if present
  if (decryptedBytes[0] === 0x00) {
    decryptedBytes = decryptedBytes.subarray(1)
  }

  if (decryptedBytes.length < 2) {
    return null
  }

  // Get trailing flag byte
  let flagByte = decryptedBytes[decryptedBytes.length - 1]
  if (flagByte === 0xcc) {
    flagByte = decryptedBytes[decryptedBytes.length - 2]
  }

  switch (flagByte) {
    case 0x33:
    case 0xbc:
      return 'SHA1'
    case 0x34:
      return 'SHA256'
    case 0x35:
      return 'SHA512'
    case 0x36:
      return 'SHA384'
    case 0x38:
      return 'SHA224'
    default:
      return 'SHA256' // fallback/default
  }
}

// TODO: not tested yet
/**
 * Normalize ECDSA signature (r||s) into low-S form with fixed-length output.
 */
export function normalizeSignatureWithCurve(signature: Uint8Array, curveName: string): Uint8Array {
  const ec = new EC(curveName)

  if (!ec.n) {
    throw new Error(`Curve ${curveName} is not supported or does not have a defined order (n).`)
  }

  const byteLength = signature.length / 2

  const rBytes = signature.slice(0, byteLength)
  const sBytes = signature.slice(byteLength)

  const r = new forge.jsbn.BigInteger(Buffer.from(rBytes).toString('hex'), 16)
  let s = new forge.jsbn.BigInteger(Buffer.from(sBytes).toString('hex'), 16)

  const n = new forge.jsbn.BigInteger(ec.n.toString(16), 16)
  const lowSMax = n.divide(new forge.jsbn.BigInteger('2'))

  if (s.compareTo(lowSMax) > 0) {
    s = n.subtract(s)
  }

  const paddedR = zeroPadValue('0x' + r.toString(16), byteLength)
  const paddedS = zeroPadValue('0x' + s.toString(16), byteLength)

  return new Uint8Array([...getBytes(paddedR), ...getBytes(paddedS)])
}
