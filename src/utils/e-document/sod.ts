import { time } from '@distributedlab/tools'
import { SOD } from '@li0ard/tsemrtd'
import { CertificateSet, ContentInfo, id_signedData, SignedData } from '@peculiar/asn1-cms'
import { ECParameters, id_ecdsaWithSHA1 } from '@peculiar/asn1-ecc'
import { id_pkcs_1, RSAPublicKey } from '@peculiar/asn1-rsa'
import { AsnConvert, AsnSerializer } from '@peculiar/asn1-schema'
import {
  AuthorityKeyIdentifier,
  Certificate,
  id_ce_authorityKeyIdentifier,
  id_ce_subjectKeyIdentifier,
  SubjectKeyIdentifier,
} from '@peculiar/asn1-x509'
import * as x509 from '@peculiar/x509'
import { fromBER, Set } from 'asn1js'
import { Buffer } from 'buffer'
import { ec as EC } from 'elliptic'
import { getBytes, zeroPadValue } from 'ethers'

import { hashPacked } from './helpers/crypto'
import { normalizeSignatureWithCurve } from './helpers/misc'

export class Sod {
  private sodBytes: Uint8Array
  private certSet: CertificateSet

  constructor(readonly sod: Uint8Array) {
    this.sodBytes = sod

    const { certificates } = SOD.load(Buffer.from(sod))

    this.certSet = certificates
  }

  get bytes(): Uint8Array {
    return this.sodBytes
  }

  get valueBlockBytes(): Uint8Array {
    const { result } = fromBER(this.sodBytes)

    return new Uint8Array(result.valueBlock.toBER())
  }

  get slaveCert(): Certificate {
    if (!this.certSet[0].certificate) throw new TypeError('No certificate found in SOD')

    return this.certSet[0].certificate
  }

  get x509SlaveCert(): x509.X509Certificate {
    const der = AsnConvert.serialize(this.slaveCert)
    return new x509.X509Certificate(der)
  }

  get slaveCertX509KeyOffset(): bigint {
    let pub: Uint8Array = new Uint8Array()

    if (
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(id_pkcs_1)
    ) {
      const rsaPub = AsnConvert.parse(
        this.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
        RSAPublicKey,
      )

      pub = new Uint8Array(rsaPub.modulus)
    }

    if (
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm === id_ecdsaWithSHA1
    ) {
      const ecParameters = AsnConvert.parse(
        this.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
        ECParameters,
      )

      if (!ecParameters.namedCurve) {
        throw new TypeError('ECDSA public key does not have a named curve')
      }

      const hexKey = Buffer.from(
        this.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
      ).toString('hex')
      const ec = new EC(ecParameters.namedCurve)
      const key = ec.keyFromPublic(hexKey, 'hex')
      const point = key.getPublic()

      const byteLength = Math.ceil(ec.curve.n.bitLength() / 8)

      pub = new Uint8Array([
        ...getBytes(zeroPadValue('0x' + point.getX().toString('hex'), byteLength)),
        ...getBytes(zeroPadValue('0x' + point.getY().toString('hex'), byteLength)),
      ])
    }

    if (!pub.length) {
      throw new TypeError(
        `Unsupported public key algorithm: ${this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm}`,
      )
    }

    const index = Buffer.from(AsnConvert.serialize(this.slaveCert.tbsCertificate))
      .toString('hex')
      .indexOf(Buffer.from(pub).toString('hex'))

    if (index === -1) {
      throw new TypeError('Public key not found in TBS Certificate')
    }

    return BigInt(index / 2) // index in bytes, not hex
  }

  get slaveCertExpOffset(): bigint {
    const tbsCertificateHex = Buffer.from(
      AsnConvert.serialize(this.slaveCert.tbsCertificate),
    ).toString('hex')

    if (!this.slaveCert.tbsCertificate.validity.notAfter.utcTime)
      throw new TypeError('Expiration time not found in TBS Certificate')

    const expirationHex = Buffer.from(
      time(this.slaveCert.tbsCertificate.validity.notAfter.utcTime?.toISOString())
        .utc()
        .format('YYMMDDHHmmss[Z]'),
      'utf-8',
    ).toString('hex')

    const index = tbsCertificateHex.indexOf(expirationHex)

    if (index < 0) {
      throw new TypeError('Expiration time not found in TBS Certificate')
    }

    return BigInt(index / 2) // index in bytes, not hex
  }

  get slaveCertIcaoMemberSignature(): Uint8Array {
    if (
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(id_pkcs_1)
    ) {
      return new Uint8Array(this.slaveCert.signatureValue)
    }

    if (
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm === id_ecdsaWithSHA1
    ) {
      const ecParameters = AsnConvert.parse(
        this.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
        ECParameters,
      )

      if (!ecParameters.namedCurve) {
        throw new TypeError('ECDSA public key does not have a named curve')
      }

      return normalizeSignatureWithCurve(
        new Uint8Array(this.slaveCert.signatureValue),
        ecParameters.namedCurve,
      )
    }

    throw new TypeError(
      `Unsupported public key algorithm: ${this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm}`,
    )
  }

  get slaveCertIcaoMemberKey(): Uint8Array {
    if (
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(id_pkcs_1)
    ) {
      const pub = AsnConvert.parse(
        this.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
        RSAPublicKey,
      )

      return new Uint8Array(pub.modulus)
    }

    if (
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm === id_ecdsaWithSHA1
    ) {
      const ecParameters = AsnConvert.parse(
        this.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
        ECParameters,
      )

      if (!ecParameters.namedCurve) {
        throw new TypeError('ECDSA public key does not have a named curve')
      }

      const hexKey = Buffer.from(
        this.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
      ).toString('hex')

      const ec = new EC(ecParameters.namedCurve)
      const key = ec.keyFromPublic(hexKey, 'hex')
      const point = key.getPublic()

      const byteLength = Math.ceil(ec.curve.n.bitLength() / 8)

      const x = getBytes(zeroPadValue('0x' + point.getX().toString('hex'), byteLength))
      const y = getBytes(zeroPadValue('0x' + point.getY().toString('hex'), byteLength))

      return new Uint8Array([...x, ...y])
    }

    throw new TypeError(
      `Unsupported public key algorithm: ${this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm}`,
    )
  }

  get encapsulatedContent(): Uint8Array {
    const contentInfo = AsnConvert.parse(this.valueBlockBytes, ContentInfo)

    if (contentInfo.contentType !== id_signedData) {
      throw new TypeError(
        `Invalid ContentType: Expected ${id_signedData} (SignedData), but got ${contentInfo.contentType}`,
      )
    }

    const signedData = AsnConvert.parse(contentInfo.content, SignedData)

    return new Uint8Array(signedData.encapContentInfo.eContent?.single?.buffer || [])
  }

  get signedAttributes(): Uint8Array {
    const contentInfo = AsnConvert.parse(this.valueBlockBytes, ContentInfo)

    if (contentInfo.contentType !== id_signedData) {
      throw new TypeError(
        `Invalid ContentType: Expected ${id_signedData} (SignedData), but got ${contentInfo.contentType}`,
      )
    }

    const signedData = AsnConvert.parse(contentInfo.content, SignedData)

    if (!signedData.signerInfos || signedData.signerInfos.length === 0) {
      throw new TypeError('No signerInfos found in SignedData')
    }

    const signerInfo = signedData.signerInfos[0]

    if (!signerInfo.signedAttrs?.length) {
      throw new TypeError('No signed attributes found in SignerInfo')
    }

    /* ----- The usual ICAO case: sign over the SET of attributes ----------- */
    // Convert signed attributes to a SET structure using AsnConvert
    const attrsSet = new Set({
      value: signerInfo.signedAttrs.map(a => AsnSerializer.toASN(a)), // ⇐ ASN.1 objects
    })

    return new Uint8Array(attrsSet.toBER(false)) // DER-encoded
  }

  get signature(): Uint8Array {
    const contentInfo = AsnConvert.parse(this.valueBlockBytes, ContentInfo)
    if (contentInfo.contentType !== id_signedData) {
      throw new TypeError(
        `Invalid ContentType: Expected ${id_signedData} (SignedData), but got ${contentInfo.contentType}`,
      )
    }
    const signedData = AsnConvert.parse(contentInfo.content, SignedData)
    if (!signedData.signerInfos || signedData.signerInfos.length === 0) {
      throw new TypeError('No signerInfos found in SignedData')
    }
    const signerInfo = signedData.signerInfos[0]
    if (!signerInfo.signature) {
      throw new TypeError('No signature found in SignerInfo')
    }
    return new Uint8Array(signerInfo.signature.buffer)
  }

  async getSlaveMaster(CSCAs: Certificate[]) {
    const slaveAuthorityKeyIdentifierExtension = this.x509SlaveCert.extensions?.find(
      el => el.type === id_ce_authorityKeyIdentifier,
    )

    if (!slaveAuthorityKeyIdentifierExtension) {
      throw new TypeError('Slave certificate does not have AuthorityKeyIdentifier extension')
    }

    const parsedSlaveAuthorityKeyIdentifierExtension = AsnConvert.parse(
      slaveAuthorityKeyIdentifierExtension.value,
      AuthorityKeyIdentifier,
    )

    const parsedSlaveAuthorityKeyIdentifierExtensionHex = Buffer.from(
      parsedSlaveAuthorityKeyIdentifierExtension.keyIdentifier!.buffer,
    ).toString('hex')

    const candidates = CSCAs.reduce((acc, curr) => {
      try {
        const x509Cert = new x509.X509Certificate(AsnConvert.serialize(curr))

        if (
          this.x509SlaveCert.issuer === x509Cert.subject
          // && parsedSlaveAuthorityKeyIdentifierExtensionHex === subjectKeyIdentifierExtension
        ) {
          acc.push(x509Cert)
        }
      } catch (error) {
        /* empty */
      }
      return acc
    }, [] as x509.X509Certificate[]).filter(cert => {
      const subjectKeyIdentifierExtension = cert.extensions?.find(
        el => el.type === id_ce_subjectKeyIdentifier,
      )

      if (!subjectKeyIdentifierExtension) {
        throw new TypeError('CSCA does not have SubjectKeyIdentifier extension')
      }

      const parsedSubjectKeyIdentifierExtension = AsnConvert.parse(
        subjectKeyIdentifierExtension.value,
        SubjectKeyIdentifier,
      )

      return (
        Buffer.from(parsedSubjectKeyIdentifierExtension.buffer).toString('hex') ===
        parsedSlaveAuthorityKeyIdentifierExtensionHex
      )
    })

    return candidates[0]
  }

  get slaveCertificateIndex(): Uint8Array {
    if (
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(id_pkcs_1)
    ) {
      const rsa = AsnConvert.parse(
        this.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
        RSAPublicKey,
      )
      const modulusBytes = new Uint8Array(rsa.modulus)
      const unpadded = modulusBytes[0] === 0x00 ? modulusBytes.subarray(1) : modulusBytes

      return hashPacked(unpadded)
    }

    if (
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm.includes(
        '1.2.840.10045',
      )
    ) {
      const ecParameters = AsnConvert.parse(
        this.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
        ECParameters,
      )

      if (!ecParameters.namedCurve) {
        throw new TypeError('ECDSA public key does not have a named curve')
      }

      const hexKey = Buffer.from(
        this.slaveCert.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
      ).toString('hex')

      const ec = new EC(ecParameters.namedCurve)
      const key = ec.keyFromPublic(hexKey, 'hex')
      const point = key.getPublic()

      const byteLength = Math.ceil(ec.curve.n.bitLength() / 8)

      const x = getBytes(zeroPadValue('0x' + point.getX().toString('hex'), byteLength))
      const y = getBytes(zeroPadValue('0x' + point.getY().toString('hex'), byteLength))

      return new Uint8Array([...x, ...y])
    }

    throw new TypeError(
      `Unsupported public key algorithm: ${this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm}`,
    )
  }
}
