import { Hex } from '@iden3/js-crypto'
import { ExternalCircuitParams } from '@modules/witnesscalculator'
import { ECDSASigValue } from '@peculiar/asn1-ecc'
import { RSAPublicKey } from '@peculiar/asn1-rsa'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { ShaAlgorithm } from '@peculiar/x509'
import { toBeArray, toBigInt } from 'ethers'

import { EDocument } from '@/utils/e-document/e-document'

import { extractPubKey } from '../e-document/helpers/misc'
import { CircuitDocumentType, HASH_ALGORITHMS } from './constants'
import { PrivateRegisterIdentityBuilderGroth16 } from './types/RegisterIdentityBuilder'

export class RegistrationCircuit {
  public prefixName = 'registerIdentity'

  get hashAlgorithm() {
    const hashAlgorithm = new ShaAlgorithm().toAsnAlgorithm(
      this.eDoc.sod.x509SlaveCert.signatureAlgorithm.hash,
    )

    if (!hashAlgorithm?.algorithm) {
      throw new TypeError(
        `Unsupported hash algorithm: ${this.eDoc.sod.x509SlaveCert.signatureAlgorithm.hash.name}`,
      )
    }

    return hashAlgorithm
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
    const hash = computeHash(this.hashAlgorithm.algorithm, this.eDoc.dg1Bytes)

    return (
      Hex.encodeString(this.eDoc.sod.encapsulatedContent).split(Hex.encodeString(hash))[0].length /
      2
    )
  }

  get encapContentShift() {
    const hash = computeHash(this.hashAlgorithm.algorithm, this.eDoc.sod.encapsulatedContent)

    return Hex.encodeString(this.eDoc.sodBytes).split(Hex.encodeString(hash))[0].length / 2
  }

  get dg15Shift() {
    if (!this.eDoc.dg15Bytes) return 0

    const hash = computeHash(this.hashAlgorithm.algorithm, this.eDoc.dg15Bytes)

    return (
      Hex.encodeString(this.eDoc.sod.encapsulatedContent).split(Hex.encodeString(hash))[0].length /
      2
    )
  }

  get chunkedParams() {
    return getChunkedParams(this.eDoc.sod.slaveCert)
  }

  get sigType() {
    if (sig.salt) {
      // RSA PSS
      if (pk.n.length == 512 && pk.exp == '3' && sig.salt == '32' && hashType == '32') {
        return 10
      }
      if (pk.n.length == 512 && pk.exp == '10001' && sig.salt == '32' && hashType == '32') {
        return 11
      }
      if (pk.n.length == 512 && pk.exp == '10001' && sig.salt == '64' && hashType == '32') {
        return 12
      }
      if (pk.n.length == 512 && pk.exp == '10001' && sig.salt == '48' && hashType == '48') {
        return 13
      }
      if (pk.n.length == 768 && pk.exp == '10001' && sig.salt == '32' && hashType == '32') {
        return 14
      }
    }
    if (sig.salt == 0) {
      // RSA
      if (pk.n.length == 512 && pk.exp == '10001' && hashType == '32') {
        return 1
      }
      if (pk.n.length == 1024 && pk.exp == '10001' && hashType == '32') {
        return 2
      }
      if (pk.n.length == 512 && pk.exp == '10001' && hashType == '20') {
        return 3
      }
    }
    if (sig.r) {
      // print(pk.param);
      switch (pk.param) {
        case '7D5A0975FC2C3057EEF67530417AFFE7FB8055C126DC5C6CE94A4B44F330B5D9':
          // BrainpoolP256r1
          return 21

        case 'FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC':
          // Secp256r1
          return 20

        case 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE':
          //secp224r1
          return 24

        case '7BC382C63D8C150C3C72080ACE05AFA0C2BEA28E4FB22787139165EFBA91F90F8AA5814A503AD4EB04A8C7DD22CE2826':
          // BrainpoolP384r1
          return 25

        case '7830A3318B603B89E2327145AC234CC594CBDD8D3DF91610A83441CAEA9863BC2DED5D5AA8253AA10A2EF1C98B9AC8B57F1117A72BF2C7B9E7C1AC4D77FC94CA':
          //BrainpoolP512r1
          return 26

        case 'secp521r1':
          return 27
        default:
          return 0
      }
    }

    return 0
  }

  // 1_256_3_5_576_248_NA
  // 1 - sig_type
  // 256 - hash algorithm
  // 3 - document type
  // 5 - ec_chunk_number
  // 576 - ec_digest_position_shift
  // 248 - dg1_digest_position_shift
  // NA - 1_2432_5_296
  // 1 - static_id
  // 2432 - dg15_chunk_number
  // 5 - dg15_digest_position_shift
  // 296 - aa_key_position_shift
  get name(): string {
    const dgHashTypeLen = HASH_ALGORITHMS[this.hashAlgorithm.algorithm].len
    const dgHashTypeLenBits = HASH_ALGORITHMS[this.hashAlgorithm.algorithm].len * 8

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

    const aaSigType = null
    const aaShiftBits = null

    const dg15ShiftBits = this.dg15Shift * 8

    const dg15EcChunkNumber =
      dgHashTypeLen <= 32
        ? Math.ceil((this.eDoc.dg15Bytes.length + 8) / 64)
        : Math.ceil((this.eDoc.dg15Bytes.length + 8) / 128)

    return [...defaultNameParts, aaSigType, dg15ShiftBits, dg15EcChunkNumber, aaShiftBits].join('_')
  }

  get circuitParams(): ExternalCircuitParams {
    return ExternalCircuitParams.fromName(this.name)
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
      pubkey: extractPubKey(this.eDoc.sod.slaveCert),
      signature: this.eDoc.sod.signature,
      skIdentity: params.skIdentity,
      slaveMerkleRoot: params.slaveMerkleRoot,
      slaveMerkleInclusionBranches: params.slaveMerkleInclusionBranches,
    }

    return this.circuitParams.wtnsCalcMethod(datBytes, Buffer.from(JSON.stringify(inputs)))
  }
}

const getChunkedParams = (certificate: Certificate) => {
  const pubKey = extractPubKey(certificate)

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
