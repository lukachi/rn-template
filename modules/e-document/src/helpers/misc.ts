import {
  calcWtnsRegisterIdentityUniversalRSA2048,
  calcWtnsRegisterIdentityUniversalRSA4096,
} from '@modules/witnesscalculator'
import get from 'lodash/get'
import { ec as EC } from 'elliptic'
import forge from 'node-forge'

import { CircuitType } from '../enums'
import { DocType } from '../types'
import { NewEDocument } from './e-document'
import { RSAPublicKey } from '@peculiar/asn1-rsa'
import { getBytes, zeroPadValue } from 'ethers'

export function getDocType(documentCode: string): DocType | null {
  if (documentCode.includes('I')) {
    return DocType.ID
  }

  if (documentCode.includes('P')) {
    return DocType.PASSPORT
  }

  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDocumentIOS(object: any, docType: DocType): NewEDocument {
  return new NewEDocument({
    docType: docType,
    personDetails: {
      firstName: get(object, 'personDetails.firstName', null),
      lastName: get(object, 'personDetails.lastName', null),
      gender: get(object, 'personDetails.gender', null),
      birthDate: get(object, 'personDetails.dateOfBirth', null),
      expiryDate: get(object, 'personDetails.documentExpiryDate', null),
      documentNumber: get(object, 'personDetails.documentNumber', null),
      nationality: get(object, 'personDetails.nationality', null),
      issuingAuthority: get(object, 'personDetails.issuingAuthority', null),
      passportImageRaw: get(object, 'personDetails.passportImageRaw', null),
    },
    sodBytes: Buffer.from(get(object, 'sod', ''), 'base64'),
    dg1Bytes: Buffer.from(get(object, 'dg1', ''), 'base64'),
    dg15Bytes: Buffer.from(get(object, 'dg15', ''), 'base64'),
    dg11Bytes: Buffer.from(get(object, 'dg11', ''), 'base64'),
    aaSignature: Buffer.from(get(object, 'signature', ''), 'base64'),
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDocumentAndroid(object: any, docType: DocType): NewEDocument {
  return new NewEDocument({
    docType: docType,
    personDetails: {
      firstName: get(object, 'personDetails.primaryIdentifier', null),
      lastName: get(object, 'personDetails.secondaryIdentifier', null),
      gender: get(object, 'personDetails.gender', null),
      birthDate: get(object, 'personDetails.dateOfBirth', null),
      expiryDate: get(object, 'personDetails.dateOfExpiry', null),
      documentNumber: get(object, 'personDetails.documentNumber', null),
      nationality: get(object, 'personDetails.nationality', null),
      issuingAuthority: get(object, 'personDetails.issuingState', null),
      passportImageRaw: get(object, 'personDetails.passportImageRaw', null),
    },
    sodBytes: Buffer.from(get(object, 'sod', ''), 'base64'),
    dg1Bytes: Buffer.from(get(object, 'dg1', ''), 'base64'),
    dg15Bytes: Buffer.from(get(object, 'dg15', ''), 'base64'),
    dg11Bytes: Buffer.from(get(object, 'dg11', ''), 'base64'),
    aaSignature: Buffer.from(get(object, 'signature', ''), 'base64'),
  })
}

export function getCircuitType(pubKeySize: number) {
  return {
    2048: CircuitType.RegisterIdentityUniversalRSA2048,
    4096: CircuitType.RegisterIdentityUniversalRSA4096,
  }[pubKeySize]
}

export function getCircuitDetailsByType(circuitType: CircuitType) {
  const circuitDownloadUrl = {
    [CircuitType.RegisterIdentityUniversalRSA2048]:
      'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.1.0-alpha/registerIdentityUniversalRSA2048-download.zip',
    [CircuitType.RegisterIdentityUniversalRSA4096]:
      'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.1.0-alpha/registerIdentityUniversalRSA4096-download.zip',
  }[circuitType]

  const wtnsCalcMethod = {
    [CircuitType.RegisterIdentityUniversalRSA2048]: calcWtnsRegisterIdentityUniversalRSA2048,
    [CircuitType.RegisterIdentityUniversalRSA4096]: calcWtnsRegisterIdentityUniversalRSA4096,
  }[circuitType]

  const circuitTypeCertificatePubKeySize = {
    [CircuitType.RegisterIdentityUniversalRSA2048]: 2048,
    [CircuitType.RegisterIdentityUniversalRSA4096]: 4096,
  }[circuitType]

  return {
    circuitDownloadUrl,
    wtnsCalcMethod,
    circuitTypeCertificatePubKeySize,
  }
}

export const decodeDerFromPemBytes = (bytes: Uint8Array): ArrayBuffer =>
  Buffer.from(
    Buffer.from(bytes)
      .toString('utf8')
      .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
      .replace(/\s+/g, ''),
    'base64',
  ).buffer

export function toPem(buf: ArrayBuffer, header: string): string {
  const body = Buffer.from(buf)
    .toString('base64')
    .replace(/(.{64})/g, '$1\n')
  return `-----BEGIN ${header}-----\n${body}\n-----END ${header}-----\n`
}

export const toDer = (blob: Uint8Array | string): Uint8Array => {
  const str = typeof blob === 'string' ? blob : new TextDecoder().decode(blob)
  if (str.includes('-----BEGIN')) {
    // PEM detected
    const b64 = str
      .replace(/-----BEGIN [^-]+-----/, '')
      .replace(/-----END [^-]+-----/, '')
      .replace(/\s+/g, '')
    return Uint8Array.from(Buffer.from(b64, 'base64'))
  }
  return typeof blob === 'string' ? Uint8Array.from(Buffer.from(str, 'binary')) : blob
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
