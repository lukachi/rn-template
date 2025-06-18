import { id_ecdsaWithSHA1 } from '@peculiar/asn1-ecc'
import { id_rsaEncryption, id_RSASSA_PSS } from '@peculiar/asn1-rsa'

import { SupportedCurves } from '@/utils/curves/curves'
import { EDocument } from '@/utils/e-document/e-document'

import { CircuitParams, supportedCircuits } from './config'
import {
  CircuitAlgorithm,
  CircuitDocumentType,
  CircuitExponent,
  CircuitHashAlgorithm,
  CircuitKeySize,
  CircuitSalt,
} from './enums'

export class RegistrationCircuit {
  private constructor(
    public prefixName: string,
    public staticId: number,
    public hashAlgorithm: CircuitHashAlgorithm,
    public docType: CircuitDocumentType,
    // public algorithm: CircuitAlgorithm,
    public keySize: CircuitKeySize,

    public circuitParams: CircuitParams,

    public exponent?: CircuitExponent,
    public salt?: CircuitSalt,
    public curve?: SupportedCurves,
  ) {}

  static fromEDoc(eDoc: EDocument): RegistrationCircuit {
    // 1_256_3_5_576_248_NA
    // 1 - static_id
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

    const prefixName = 'registerIdentity'

    const hashAlgorithm: CircuitHashAlgorithm = (() => {
      const hashName = eDoc.sod.x509SlaveCert.signatureAlgorithm.hash.name.toUpperCase()
      switch (hashName) {
        case 'SHA-1':
          return CircuitHashAlgorithm.SHA160
        case 'SHA-256':
          return CircuitHashAlgorithm.SHA256
        case 'SHA-384':
          return CircuitHashAlgorithm.SHA384
        case 'SHA-224':
          return CircuitHashAlgorithm.SHA224
        case 'SHA-512':
          return CircuitHashAlgorithm.SHA512
        default:
          throw new TypeError(`Unsupported hash algorithm: ${hashName}`)
      }
    })()
    const docType: CircuitDocumentType = (() => {
      switch (eDoc.docType) {
        case 'ID':
          return CircuitDocumentType.TD1
        case 'PASSPORT':
          return CircuitDocumentType.TD3
        default:
          return CircuitDocumentType.TD3
      }
    })()
    const ecChunkNumber = this.#getChunkNumber(eDoc.sod.encapsulatedContent, hashAlgorithm)
    const ecDigestPositionShift = (() => {
      const ecHash = Buffer.from(
        eDoc.sod.x509SlaveCert.signatureAlgorithm.hash.name,
        'utf-8',
      ).toString('hex')
      const encapsulatedContentHex = Buffer.from(eDoc.sod.encapsulatedContent).toString('hex')

      const bytesLength = encapsulatedContentHex.indexOf(ecHash) / 2

      return bytesLength * 8
    })()

    const dg1DigestPositionShift = (() => {
      const dg1Hex = Buffer.from(eDoc.dg1Bytes).toString('hex')
      return Buffer.from(eDoc.sod.encapsulatedContent).toString('hex').indexOf(dg1Hex) / 2
    })()

    if (!eDoc.dg15Bytes || !eDoc.dg15PubKey) {
      const staticId = supportedCircuits
        .map(el => el.name)
        .find(el => {
          return (
            el.startsWith(prefixName) &&
            el.includes(String(hashAlgorithm)) &&
            el.includes(String(docType)) &&
            el.includes(String(ecChunkNumber)) &&
            el.includes(String(ecDigestPositionShift)) &&
            el.includes(String(dg1DigestPositionShift))
          )
        })
        ?.split('_')[1]

      if (!staticId) {
        throw new Error(
          `No matching circuit found for the provided parameters: ${prefixName}, ${hashAlgorithm}, ${docType}, ${ecChunkNumber}, ${ecDigestPositionShift}, ${dg1DigestPositionShift}`,
        )
      }

      const name = [
        prefixName,
        staticId,
        hashAlgorithm,
        docType,
        ecChunkNumber,
        ecDigestPositionShift,
        dg1DigestPositionShift,
        '_NA',
      ].join('_')

      const circuitParams = CircuitParams.fromName(name)

      // TODO: check me
      const keySize = (() => {
        return eDoc.sod.x509SlaveCert.publicKey.rawData.byteLength * 8
      })()

      return new RegistrationCircuit(
        prefixName,
        Number(staticId),
        hashAlgorithm,
        docType,
        keySize,

        circuitParams,
      )
    }

    const dg15Hex = Buffer.from(eDoc.dg15Bytes).toString('hex')

    const dg15DigestPositionShift = (() => {
      const bytesLength =
        Buffer.from(eDoc.sod.encapsulatedContent).toString('hex').indexOf(dg15Hex) / 2
      return bytesLength * 8
    })()

    const dg15ChunkNumber = this.#getChunkNumber(eDoc.dg15Bytes, hashAlgorithm)

    const aaKeyPositionShift =
      dg15Hex.indexOf(Buffer.from(eDoc.dg15PubKey.subjectPublicKey).toString('hex')) / 2

    // TODO: check for ecdsa or use regex
    const algorithm = (() => {
      switch (eDoc.sod.slaveCert.signatureAlgorithm.algorithm) {
        case id_rsaEncryption:
          return CircuitAlgorithm.RSA
        case id_RSASSA_PSS:
          return CircuitAlgorithm.RSAPSS
        case id_ecdsaWithSHA1:
          return CircuitAlgorithm.ECDSA
        default:
          throw new TypeError(
            `Unsupported circuit algorithm: ${eDoc.sod.slaveCert.signatureAlgorithm.algorithm}`,
          )
      }
    })()

    const aaTypeId = (() => {
      if (algorithm === CircuitAlgorithm.RSA && hashAlgorithm === CircuitHashAlgorithm.SHA160) {
        return 1
      }

      if (algorithm === CircuitAlgorithm.ECDSA && hashAlgorithm === CircuitHashAlgorithm.SHA160) {
        return 21
      }

      throw new TypeError(
        `Unsupported circuit algorithm/hash combination: ${algorithm}/${hashAlgorithm}`,
      )
    })()

    const staticId = supportedCircuits
      .map(el => el.name)
      .find(el => {
        return (
          el.startsWith(prefixName) &&
          el.includes(String(hashAlgorithm)) &&
          el.includes(String(docType)) &&
          el.includes(String(ecChunkNumber)) &&
          el.includes(String(ecDigestPositionShift)) &&
          el.includes(String(dg1DigestPositionShift)) &&
          el.includes(String(aaTypeId)) &&
          el.includes(String(dg15DigestPositionShift)) &&
          el.includes(String(dg15ChunkNumber)) &&
          el.includes(String(aaKeyPositionShift))
        )
      })
      ?.split('_')[1]

    if (!staticId) {
      throw new Error(
        `No matching circuit found for the provided parameters: ${[
          prefixName,
          hashAlgorithm,
          docType,
          ecChunkNumber,
          ecDigestPositionShift,
          dg1DigestPositionShift,
          aaTypeId,
          dg15DigestPositionShift,
          dg15ChunkNumber,
          aaKeyPositionShift,
        ].join('_')}`,
      )
    }

    const name = [
      prefixName,
      staticId,
      hashAlgorithm,
      docType,
      ecChunkNumber,
      ecDigestPositionShift,
      dg1DigestPositionShift,
      aaTypeId,
      dg15DigestPositionShift,
      dg15ChunkNumber,
      aaKeyPositionShift,
    ].join('_')

    const circuitParams = CircuitParams.fromName(name)

    // TODO: check me
    const keySize = (() => {
      return eDoc.sod.x509SlaveCert.publicKey.rawData.byteLength * 8
    })()

    return new RegistrationCircuit(
      prefixName,
      Number(staticId),
      hashAlgorithm,
      docType,
      keySize,

      circuitParams,
    )
  }

  static #getChunkNumber(data: Uint8Array, hashAlgorithm: CircuitHashAlgorithm): number {
    const length = data.length * 8 + 1 + 64
    const chunkSize = (() => {
      switch (hashAlgorithm) {
        case CircuitHashAlgorithm.SHA160:
        case CircuitHashAlgorithm.SHA256:
          return 512
        case CircuitHashAlgorithm.SHA384:
        case CircuitHashAlgorithm.SHA224:
        case CircuitHashAlgorithm.SHA512:
          return 1024
        default:
          throw new TypeError('Unsupported hash algorithm')
      }
    })()

    return length / chunkSize + (length % chunkSize == 0 ? 0 : 1)
  }
}
