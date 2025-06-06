import { poseidon } from '@iden3/js-crypto'
import { SOD } from '@li0ard/tsemrtd'
import { CertificateSet, ContentInfo, id_signedData, SignedData } from '@peculiar/asn1-cms'
import { id_rsaEncryption, RSAPublicKey } from '@peculiar/asn1-rsa'
import { AsnConvert, AsnSerializer } from '@peculiar/asn1-schema'
import { Certificate, SubjectPublicKeyInfo } from '@peculiar/asn1-x509'
import { fromBER, Set } from 'asn1js'
import { Buffer } from 'buffer'
import { getBytes } from 'ethers'

/* ------------------------------------------------------------------ */
/* Tiny helpers                                                       */
/* ------------------------------------------------------------------ */

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

const decodeDerFromPemBytes = (bytes: Uint8Array): ArrayBuffer =>
  Buffer.from(
    Buffer.from(bytes)
      .toString('utf8')
      .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
      .replace(/\s+/g, ''),
    'base64',
  ).buffer

// function pecToPki(cert: PecCert): PkiCert {
//   const { result } = fromBER(AsnConvert.serialize(cert))
//   return new PkiCert({ schema: result })
// }

function toPem(buf: ArrayBuffer, header: string): string {
  const body = Buffer.from(buf)
    .toString('base64')
    .replace(/(.{64})/g, '$1\n')
  return `-----BEGIN ${header}-----\n${body}\n-----END ${header}-----\n`
}

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

  get slaveCertPemBytes(): Uint8Array {
    const der = AsnConvert.serialize(this.certSet[0].certificate)
    return new Uint8Array(Buffer.from(toPem(der, 'CERTIFICATE')))
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

  // FIXME: hasPacked from rsa pub key is valid, but master roots is not being verifyed
  async getSlaveCertificateIndex(
    slaveCertPemBytes: Uint8Array | Buffer,
    icaoBytes: Uint8Array | Buffer,
  ): Promise<Uint8Array> {
    const slavePec = AsnConvert.parse(decodeDerFromPemBytes(slaveCertPemBytes), Certificate)
    // const slavePki = pecToPki(slavePec)

    // // Initialize arrays for chain certificates and trusted roots
    // // 'certsForEngine' will contain all certificates that pkijs can use to build the chain
    // const certsForEngine: PkiCert[] = [slavePki]
    // // 'trustedRoots' will contain only the self-signed certificates that are explicitly trusted
    // const trustedRoots: PkiCert[] = []

    // // console.log('--- Parsing ICAO Certificates ---')
    // const ascii = Buffer.from(icaoBytes).toString('utf8')
    // if (ascii.includes('BEGIN CERTIFICATE')) {
    //   // Handle PEM formatted ICAO bytes
    //   for (const match of ascii.matchAll(
    //     /-----BEGIN CERTIFICATE-----[^-]+-----END CERTIFICATE-----/g,
    //   )) {
    //     const pec = AsnConvert.parse(decodeDerFromPemBytes(Buffer.from(match[0])), PecCert)
    //     const pkiCert = pecToPki(pec)

    //     // Add ALL parsed certificates to certsForEngine, as pkijs needs them to build the chain
    //     certsForEngine.push(pkiCert)

    //     // Check if the certificate is self-signed (issuer === subject) to identify trusted roots
    //     if (pkiCert.issuer.toString() === pkiCert.subject.toString()) {
    //       trustedRoots.push(pkiCert)
    //     }
    //   }
    // } else {
    //   // Handle PKD formatted ICAO bytes
    //   const masterList = PKD.load(Buffer.from(icaoBytes))
    //   for (const choice of masterList.certificates) {
    //     if (choice.certificate) {
    //       const pkiCert = pecToPki(choice.certificate)

    //       // Add ALL parsed certificates to certsForEngine
    //       certsForEngine.push(pkiCert)

    //       // Check if self-signed to identify trusted roots
    //       if (pkiCert.issuer.toString() === pkiCert.subject.toString()) {
    //         trustedRoots.push(pkiCert)
    //       }
    //     }
    //   }
    // }

    // if (!trustedRoots.length) {
    //   throw new TypeError(
    //     'No self-signed CSCA certificates identified as trust anchors from ICAO bytes.',
    //   )
    // }

    // // Initialize the CertificateChainValidationEngine
    // const engine = new CertificateChainValidationEngine({
    //   certs: certsForEngine, // Contains the slave cert and ALL other ICAO certificates (intermediates and roots)
    //   trustedCerts: trustedRoots, // Contains only self-signed roots that are explicitly trusted
    //   crls: [],
    //   ocsps: [],
    //   checkDate: new Date(), // Use current date for validity checks
    //   // Custom findIssuer for detailed logging during chain building
    //   findIssuer: async (certificate, validationEngine, crypto) => {
    //     // Use the default findIssuer logic provided by pkijs
    //     const issuers = await validationEngine.defaultFindIssuer(
    //       certificate,
    //       validationEngine,
    //       crypto,
    //     )

    //     if (issuers.length === 0) {
    //       console.error(
    //         `  No issuer found for "${certificate.subject.toString()}" within the provided 'certs' pool. Chain building halted.`,
    //       )
    //     }
    //     return issuers
    //   },
    // })

    // console.log('--- Attempting Certificate Chain Validation ---')
    // let validationResult
    // try {
    //   validationResult = await engine.verify()
    //   // console.log('Validation Result:', {
    //   //   result: validationResult.result,
    //   //   resultCode: validationResult.resultCode,
    //   //   resultMessage: validationResult.resultMessage,
    //   //   certificatePath: validationResult.certificatePath?.map(c => c.subject.toString()),
    //   // })

    //   if (validationResult.result) {
    //     // console.log('Certificate chain validation successful!')
    //   } else {
    //     // console.error(
    //     //   `Certificate chain validation failed: ${validationResult.resultMessage} (Code: ${validationResult.resultCode})`,
    //     // )
    //     // // If validation fails, provide more context from the engine's internal state
    //     // console.log('Certificates provided to engine (certs array):')
    //     // engine.certs.forEach(c => logCertDetails(c, 'Engine Certs Array'))
    //     // console.log('Trusted certificates provided to engine (trustedCerts array):')
    //     // engine.trustedCerts.forEach(c => logCertDetails(c, 'Engine Trusted Certs Array'))
    //   }
    // } catch (error) {
    //   console.error('An error occurred during chain validation:', error)
    //   // throw new TypeError(
    //   //   `Chain validation error: ${error instanceof Error ? error.message : String(error)}`,
    //   // )
    // }

    // if (!validationResult || !validationResult.result) {
    //   throw new TypeError('Slave cert does not validate against ICAO roots.')
    // }

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

    /* 5 ▸ SHA-256(modulus) → index ------------------------------------ */
    return hashPacked(unpadded)
  }
}

export function getDg15PubKeyPem(dg15Bytes: Uint8Array) {
  const { result } = fromBER(dg15Bytes)

  if (!result) {
    throw new Error('BER-decode failed - DG15 file corrupted?')
  }

  const subjectPublicKeyInfo = AsnConvert.parse(
    result.valueBlock.toBER(false),
    SubjectPublicKeyInfo,
  )

  return Buffer.from(toPem(AsnConvert.serialize(subjectPublicKeyInfo), 'PUBLIC KEY'), 'utf8')
}
