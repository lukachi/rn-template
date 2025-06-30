import { ECParameters } from '@peculiar/asn1-ecc'
import { id_pkcs_1, RSAPublicKey } from '@peculiar/asn1-rsa'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { toBeArray } from 'ethers'
import forge from 'node-forge'

import { ECDSA_ALGO_PREFIX } from '../sod'
import { getPublicKeyFromEcParameters } from './crypto'

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

export function extractRawPubKey(certificate: Certificate): Uint8Array {
  const certPubKeyAlgo = certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm

  if (certPubKeyAlgo.includes(id_pkcs_1)) {
    const pub = AsnConvert.parse(
      certificate.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
      RSAPublicKey,
    )

    const certPubKey = new Uint8Array(pub.modulus)

    return certPubKey[0] === 0x00 ? certPubKey.slice(1) : certPubKey
  }

  if (certPubKeyAlgo.includes(ECDSA_ALGO_PREFIX)) {
    if (!certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters)
      throw new TypeError('ECDSA public key does not have parameters')

    const ecParameters = AsnConvert.parse(
      certificate.tbsCertificate.subjectPublicKeyInfo.algorithm.parameters,
      ECParameters,
    )

    const [publicKey] = getPublicKeyFromEcParameters(
      ecParameters,
      new Uint8Array(certificate.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey),
    )

    if (!publicKey) throw new TypeError('Public key not found in TBS Certificate')

    const certPubKey = new Uint8Array([...toBeArray(publicKey.px), ...toBeArray(publicKey.py)])

    return certPubKey[0] === 0x00 ? certPubKey.slice(1) : certPubKey
  }

  throw new TypeError(`Unsupported public key algorithm: ${certPubKeyAlgo}`)
}
