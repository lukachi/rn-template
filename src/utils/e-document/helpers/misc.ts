import { CurveFnWithCreate } from '@noble/curves/_shortw_utils'
import { RSAPublicKey } from '@peculiar/asn1-rsa'
import { getBytes, zeroPadValue } from 'ethers'
import forge from 'node-forge'

export function toPem(buf: ArrayBuffer, header: string): string {
  const body = Buffer.from(buf)
    .toString('base64')
    .replace(/(.{64})/g, '$1\n')
  return `-----BEGIN ${header}-----\n${body}\n-----END ${header}-----\n`
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
export function normalizeSignatureWithCurve(
  signature: Uint8Array,
  curve: CurveFnWithCreate,
): Uint8Array {
  const pointSize = signature.length / 2

  const r = BigInt(Buffer.from(signature.slice(0, pointSize)).toString('hex'))
  let s = BigInt(Buffer.from(signature.slice(pointSize)).toString('hex'))

  const n = curve.CURVE.n

  const lowSMax = n >> 1n

  if (s > lowSMax) {
    s = n - s
  }

  return new Uint8Array([
    ...getBytes(zeroPadValue('0x' + r.toString(16), pointSize)),
    ...getBytes(zeroPadValue('0x' + s.toString(16), pointSize)),
  ])
}
