import { Hex, poseidon } from '@iden3/js-crypto'
import { ECParameters } from '@peculiar/asn1-ecc'

import { namedCurveFromOID, namedCurveFromParams } from '@/utils/curves'

/**
 * HashPacked computes the Poseidon hash of 5 elements.
 * This is a TypeScript implementation matching the Go function provided.
 */
export function hashPacked(x509Key: Uint8Array): Uint8Array {
  if (x509Key.length < 5 * 24) {
    throw new TypeError('x509Key is too short')
  }

  const decomposed: bigint[] = new Array(5)
  let position = x509Key.length

  for (let i = 0; i < 5; i++) {
    if (position < 24) {
      throw new TypeError('x509Key is too short')
    }

    // Extract 24 bytes chunk (3 x 64-bit values = 24 bytes)
    const chunkBytes = x509Key.slice(position - 24, position)
    position -= 24

    const element = BigInt('0x' + Buffer.from(chunkBytes).toString('hex'))

    // Reverse byte order in 64-bit chunks
    let reversed = 0n
    for (let j = 0; j < 3; j++) {
      // Extract 64 bits chunk
      const extracted = (element >> BigInt(j * 64)) & 0xffffffffffffffffn
      // Build reversed value
      reversed = (reversed << 64n) | extracted
    }

    decomposed[i] = reversed
  }

  try {
    const hash = poseidon.hash(decomposed)
    return Hex.decodeString(hash.toString(16))
  } catch (error) {
    throw new TypeError(`Failed to compute Poseidon hash: ${error}`)
  }
}

export function namedCurveFromParameters(parameters: ECParameters, subjectPublicKey: Uint8Array) {
  if (!parameters.specifiedCurve?.fieldID.fieldType) {
    throw new TypeError('ECDSA public key does not have a specified curve')
  }

  const res = namedCurveFromOID(parameters.specifiedCurve?.fieldID.fieldType)

  if (!res) {
    return namedCurveFromParams(subjectPublicKey, parameters)
  }

  return res
}

export function PublicKeyFromEcParameters(parameters: ECParameters, subjectPublicKey: Uint8Array) {
  const namedCurve = namedCurveFromParameters(parameters, subjectPublicKey)

  const publicKey = namedCurve?.Point.fromBytes(subjectPublicKey)

  if (!publicKey) throw new TypeError('Public key not found in TBS Certificate')

  return publicKey
}
