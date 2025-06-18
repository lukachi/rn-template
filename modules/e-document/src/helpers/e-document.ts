import {
  figureOutRSAAAHashAlgorithm,
  normalizeSignatureWithCurve,
  toPem,
} from '@modules/e-document/src/helpers/misc'
import { Sod } from './sod'
import superjson from 'superjson'
import { fromBER } from 'asn1js'
import { AsnConvert } from '@peculiar/asn1-schema'
import { SubjectPublicKeyInfo } from '@peculiar/asn1-x509'
import { decodeBase64, getBytes, keccak256 } from 'ethers'
import { id_rsaEncryption, RSAPublicKey } from '@peculiar/asn1-rsa'
import { ECParameters, id_ecdsaWithSHA1 } from '@peculiar/asn1-ecc'

import forge from 'node-forge'
import { PersonDetails } from '../types'

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
      if (!ecParameters?.specifiedCurve?.base?.buffer) {
        throw new TypeError(
          'ECDSA public key does not have a ecParameters?.specifiedCurve?.base?.buffer',
        )
      }

      return new Uint8Array(this.dg15PubKey.subjectPublicKey)
    }

    throw new TypeError('Unsupported DG15 public key algorithm for AA public key extraction')
  }
}
