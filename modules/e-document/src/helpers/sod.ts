import { SOD } from '@li0ard/tsemrtd'
import { ec as EC } from 'elliptic'
import { CertificateSet, ContentInfo, id_signedData, SignedData } from '@peculiar/asn1-cms'
import { id_rsaEncryption, RSAPublicKey } from '@peculiar/asn1-rsa'
import { AsnConvert, AsnSerializer } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { fromBER, Set } from 'asn1js'
import { Buffer } from 'buffer'
import * as x509 from '@peculiar/x509'

import { hashPacked } from './crypto'
import { decodeDerFromPemBytes, toDer, toPem } from './misc'
import { X509ChainBuilder } from '@peculiar/x509'
import { time } from '@distributedlab/tools'
import { id_ecdsaWithSHA1, ECParameters } from '@peculiar/asn1-ecc'
import { getBytes, zeroPadValue } from 'ethers'
import { normalizeSignatureWithCurve } from './misc'

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

  /** Doc-signing public key in PEM (-----BEGIN PUBLIC KEY-----). */
  get publicKeyPemBytes(): Uint8Array {
    const spkiDer = AsnConvert.serialize(
      this.certSet[0].certificate?.tbsCertificate.subjectPublicKeyInfo,
    )

    return new Uint8Array(Buffer.from(toPem(spkiDer, 'PUBLIC KEY')))
  }

  get X509RSASize(): number {
    const spki = this.certSet[0].certificate?.tbsCertificate.subjectPublicKeyInfo

    if (!spki) throw new TypeError('No SubjectPublicKeyInfo in certificate')
    if (spki.algorithm.algorithm !== id_rsaEncryption)
      // RSA OID
      throw new TypeError('Public key is not RSA')

    /* 2. decode the RSAPublicKey SEQUENCE { n, e } --------------------- */
    const rsa = AsnConvert.parse(spki.subjectPublicKey, RSAPublicKey)
    const modulus = new Uint8Array(rsa.modulus)

    // For a 2048-bit key → 256 bytes (no pad) → 2048.
    // For a 4096-bit key → 513 bytes (pad) → (513 − 1) × 8 = 4096.
    return (modulus[0] === 0x00 ? modulus.length - 1 : modulus.length) * 8
  }

  get slaveCert(): Certificate {
    if (!this.certSet[0].certificate) throw new TypeError('No certificate found in SOD')

    return this.certSet[0].certificate
  }

  get x509SlaveCert(): x509.X509Certificate {
    return new x509.X509Certificate(this.slaveCertPemBytes)
  }

  get slaveCertPemBytes(): Uint8Array {
    const der = AsnConvert.serialize(this.certSet[0].certificate)
    return new Uint8Array(Buffer.from(toPem(der, 'CERTIFICATE')))
  }

  get slaveCertX509KeyOffset(): bigint {
    let pub: Uint8Array = new Uint8Array()

    if (
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm === id_rsaEncryption
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
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm === id_rsaEncryption
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
      this.slaveCert.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm === id_rsaEncryption
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
    const trustedRoots = CSCAs

    const x509Slave = new x509.X509Certificate(this.slaveCertPemBytes)

    const candidates = trustedRoots.reduce((acc, curr) => {
      try {
        const x509Cert = new x509.X509Certificate(AsnConvert.serialize(curr))
        if (x509Cert.subject === x509Slave.issuer) {
          acc.push(x509Cert)
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
      return acc
    }, [] as x509.X509Certificate[])

    const builder = new X509ChainBuilder({
      certificates: candidates,
    })

    const chain = await builder.build(x509Slave)

    if (!chain.length) {
      throw new Error('No valid chain from slave to a CSCA in the Master-List')
    }

    /* 4️⃣ The final element of the chain is the root CSCA */
    const master = chain[chain.length - 1]

    return AsnConvert.parse(master.rawData, Certificate)
  }

  get slaveCertificateIndex(): Uint8Array {
    const slavePec = AsnConvert.parse(decodeDerFromPemBytes(this.slaveCertPemBytes), Certificate)

    /* 4 ▸ extract RSA modulus from the slave public key ---------------- */
    if (slavePec.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm !== id_rsaEncryption) {
      throw new TypeError('Slave public key is not RSA')
    }

    const rsa = AsnConvert.parse(
      slavePec.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey,
      RSAPublicKey,
    )
    const modulusBytes = new Uint8Array(rsa.modulus)
    const unpadded = modulusBytes[0] === 0x00 ? modulusBytes.subarray(1) : modulusBytes

    return hashPacked(unpadded)
  }
}

const pemChainToArray = (txt: string): Uint8Array[] =>
  txt
    .split('-----BEGIN CERTIFICATE-----')
    .filter(Boolean)
    .map(chunk => toDer('-----BEGIN CERTIFICATE-----' + chunk))

/**
 * Decode a CMS Master-List / SOD buffer and return all embedded certificates.
 */
export const parseIcaoCms = (bytes: Uint8Array): Certificate[] => {
  /* Case B – simple concatenated PEM chain ------------------------------- */
  const txt = Buffer.from(bytes).toString('utf-8')

  const pems = pemChainToArray(txt)

  return pems.map(derCert => {
    const { result } = fromBER(derCert)

    return AsnConvert.parse(result.toBER(false), Certificate)
  })
}
