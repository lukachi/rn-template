import { poseidon } from '@iden3/js-crypto'
import { getBytes } from 'ethers'

/**
 * Implements Poseidon hash for bigint arrays using @iden3/js-crypto
 */
export function poseidonHash(inputs: bigint[]): Uint8Array {
  // Apply Poseidon hash from @iden3/js-crypto
  const hash = poseidon.hash(inputs)

  // Convert the resulting bigint to hex, ensure even length with padding
  let hashHex = hash.toString(16)
  if (hashHex.length % 2 !== 0) {
    hashHex = '0' + hashHex
  }

  return getBytes('0x' + hashHex)
}

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

    // Convert to BigInt using ethers v6
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
    // Compute Poseidon hash and return as bytes
    return poseidonHash(decomposed)
  } catch (error) {
    throw new TypeError(`Failed to compute Poseidon hash: ${error}`)
  }
}
