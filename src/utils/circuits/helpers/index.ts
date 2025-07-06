import {
  id_ecdsaWithSHA1,
  id_ecdsaWithSHA256,
  id_ecdsaWithSHA384,
  id_ecdsaWithSHA512,
} from '@peculiar/asn1-ecc'
import {
  id_RSASSA_PSS,
  id_sha1WithRSAEncryption,
  id_sha256,
  id_sha384,
  id_sha384WithRSAEncryption,
  id_sha512,
  id_sha512WithRSAEncryption,
  RsaSaPssParams,
} from '@peculiar/asn1-rsa'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'

import { CircuitHashAlgorithmName } from '../constants'

/**
 * Convert a byte array to an array of 0/1 numbers (MSB-first).
 */
function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = []
  for (const byte of bytes) {
    for (let i = 7; i >= 0; --i) {
      bits.push((byte >> i) & 1)
    }
  }
  return bits
}

/**
 * Convert a 64-bit unsigned integer to 64 individual bits (big-endian).
 */
function u64ToBits(value: bigint): number[] {
  const bits: number[] = new Array(64)
  for (let i = 0; i < 64; ++i) {
    // Pick bit (63-i)
    bits[i] = Number((value >> BigInt(63 - i)) & 1n)
  }
  return bits
}

/**
 * ##### Padded data hashing
    Padded data hashing enables the data padding to be handled outside the circuit. This approach offers several benefits:
    - ***Reduced Complexity***: By performing the padding outside the circuit, we reduce the number of constraints the circuit must manage.
    - ***Increased Flexibility***: This method allows for accommodating variations in passport structure without disrupting the strict verification process.
 * SHA-style padding (1-bit + zeros + 64-bit length) followed by
 * optional right-padding with zero blocks until the bit-stream
 * length is exactly `blockNumber × blockSize`.
 *
 * @param message        Raw message bytes.
 * @param blockNumber    Total blocks desired in the output.
 *                       If the padded message already needs
 *                       ≥ that many blocks, no extra blocks
 *                       are appended.
 * @param blockSize      Block size in **bits** (eg 512 for SHA-256).
 * @returns              An array of 0/1 numbers.
 */
export function padBitsToFixedBlocks(
  message: Uint8Array,
  blockNumber: number,
  blockSize: number,
): number[] {
  if (blockSize % 8 !== 0) {
    throw new RangeError('blockSize must be a multiple of 8 bits')
  }

  const result: number[] = []

  // 1.  Raw message bits
  const msgBits = bytesToBits(message)
  result.push(...msgBits)

  // 2.  Single ‘1’ bit
  result.push(1)

  // 3.  Zero padding so that length ≡ −64 (mod blockSize)
  const totalBitsAfter1 = msgBits.length + 1
  const lenModBlock = (totalBitsAfter1 + 64) % blockSize
  const zeroPadLen = lenModBlock === 0 ? 0 : blockSize - lenModBlock
  result.push(...new Array(zeroPadLen).fill(0))

  // 4.  64-bit big-endian length of the original message
  const msgLenBits = u64ToBits(BigInt(msgBits.length))
  result.push(...msgLenBits)

  // 5.  Extra zero blocks so that we end on blockNumber blocks
  const totalBits = result.length
  const minBlocks = Math.ceil(totalBits / blockSize)
  if (minBlocks < blockNumber) {
    const extraBits = (blockNumber - minBlocks) * blockSize
    result.push(...new Array(extraBits).fill(0))
  }

  return result
}

export function getCircuitHashAlgorithm(certificate: Certificate): CircuitHashAlgorithmName | null {
  switch (certificate.signatureAlgorithm.algorithm) {
    case id_sha1WithRSAEncryption:
    case id_ecdsaWithSHA1:
      return CircuitHashAlgorithmName.SHA1
    // TODO: need to check
    case id_RSASSA_PSS:
      if (!certificate.signatureAlgorithm.parameters)
        throw new Error('RSASSA-PSS parameters are missing')

      // eslint-disable-next-line no-case-declarations
      const rsaSaPssParams = AsnConvert.parse(
        certificate.signatureAlgorithm.parameters,
        RsaSaPssParams,
      )

      if (
        rsaSaPssParams.hashAlgorithm.algorithm === id_sha256 &&
        rsaSaPssParams.saltLength === 32
      ) {
        return CircuitHashAlgorithmName.SHA2
      }

      if (
        rsaSaPssParams.hashAlgorithm.algorithm === id_sha384 &&
        rsaSaPssParams.saltLength === 48
      ) {
        return CircuitHashAlgorithmName.SHA384
      }

      if (
        rsaSaPssParams.hashAlgorithm.algorithm === id_sha512 &&
        rsaSaPssParams.saltLength === 64
      ) {
        return CircuitHashAlgorithmName.SHA384
      }

      return null
    case id_ecdsaWithSHA256:
      return CircuitHashAlgorithmName.SHA2
    case id_sha384WithRSAEncryption:
    case id_ecdsaWithSHA384:
      return CircuitHashAlgorithmName.SHA384
    case id_sha512WithRSAEncryption:
    case id_ecdsaWithSHA512:
      return CircuitHashAlgorithmName.SHA512
    default:
      return null
  }
}
