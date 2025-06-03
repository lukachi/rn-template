import { SOD } from '@li0ard/tsemrtd'
import { Buffer } from 'buffer'
import type { CertificateSet } from '@peculiar/asn1-cms'
import { AsnConvert } from '@peculiar/asn1-schema'
import { id_rsaEncryption, RSAPublicKey } from '@peculiar/asn1-rsa'
import { fromBER } from 'asn1js'
import {
  Certificate as PkiCert,
  CertificateChainValidationEngine,
  // setEngine,
  // CryptoEngine,
  // getCrypto,
} from 'pkijs'
import { Certificate as PecCert } from '@peculiar/asn1-x509'
import { PKD } from '@li0ard/tsemrtd'
import { getBytes } from 'ethers'
// import * as Crypto from 'expo-crypto'
import { poseidon } from '@iden3/js-crypto'

// if (!getCrypto()) {
//   console.log('setting up webcrypto engine for pkijs')
//   setEngine('pkiEngine', new CryptoEngine({ crypto: Crypto }))
// }

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
    throw new Error('x509Key is too short')
  }

  const decomposed: bigint[] = new Array(5)
  let position = x509Key.length

  for (let i = 0; i < 5; i++) {
    if (position < 24) {
      throw new Error('x509Key is too short')
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
    throw new Error(`Failed to compute Poseidon hash: ${error}`)
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

function pecToPki(cert: PecCert): PkiCert {
  const { result } = fromBER(AsnConvert.serialize(cert))
  return new PkiCert({ schema: result })
}

function toPem(buf: ArrayBuffer, header: string): string {
  const body = Buffer.from(buf)
    .toString('base64')
    .replace(/(.{64})/g, '$1\n')
  return `-----BEGIN ${header}-----\n${body}\n-----END ${header}-----\n`
}

// Helper to log certificate details
// function logCertDetails(cert: PkiCert, prefix: string = '') {
//   console.log(`--- ${prefix} Certificate Details ---`)
//   console.log(`  Subject: ${cert.subject.toString()}`)
//   console.log(`  Issuer: ${cert.issuer.toString()}`)
//   console.log(`  Serial Number: ${cert.serialNumber.valueBlock.toString()}`)
//   console.log(`  Not Before: ${cert.notBefore.value}`)
//   console.log(`  Not After: ${cert.notAfter.value}`)

//   const basicConstraints = cert.extensions?.find(
//     ext => ext.extnID === '2.5.29.19', // Basic Constraints OID
//   )
//   if (basicConstraints && basicConstraints.parsedValue) {
//     const bc = basicConstraints.parsedValue as any // Type assertion for parsedValue
//     console.log(`  Basic Constraints (cA): ${bc.cA}`)
//     if (bc.pathLenConstraint !== undefined) {
//       console.log(`  Basic Constraints (pathLenConstraint): ${bc.pathLenConstraint}`)
//     }
//   }

//   const keyUsage = cert.extensions?.find(
//     ext => ext.extnID === '2.5.29.15', // Key Usage OID
//   )
//   if (keyUsage && keyUsage.parsedValue) {
//     const ku = keyUsage.parsedValue as any // Type assertion for parsedValue
//     console.log(`  Key Usage (bits): ${ku.valueBlock.valueHex.toString('hex')}`)
//     // Check for keyCertSign bit (0x04)
//     if (ku.valueBlock.valueHex[0] & 0x04) {
//       console.log(`  Key Usage: keyCertSign (CA signing) is set`)
//     }
//   }
//   console.log('-----------------------------------')
// }

export class Sod {
  private certSet: CertificateSet

  constructor(readonly sodBytes: Uint8Array) {
    const { certificates } = SOD.load(Buffer.from(sodBytes))

    this.certSet = certificates
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

    if (!spki) throw new Error('No SubjectPublicKeyInfo in certificate')
    if (spki.algorithm.algorithm !== id_rsaEncryption)
      // RSA OID
      throw new Error('Public key is not RSA')

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

  // FIXME: hasPacked from rsa pub key is valid, but master roots is not being verifyed
  async getSlaveCertificateIndex(
    slaveCertPemBytes: Uint8Array | Buffer,
    icaoBytes: Uint8Array | Buffer,
  ): Promise<Uint8Array> {
    const slavePec = AsnConvert.parse(decodeDerFromPemBytes(slaveCertPemBytes), PecCert)
    const slavePki = pecToPki(slavePec)

    // Initialize arrays for chain certificates and trusted roots
    // 'certsForEngine' will contain all certificates that pkijs can use to build the chain
    const certsForEngine: PkiCert[] = [slavePki]
    // 'trustedRoots' will contain only the self-signed certificates that are explicitly trusted
    const trustedRoots: PkiCert[] = []

    // console.log('--- Parsing ICAO Certificates ---')
    const ascii = Buffer.from(icaoBytes).toString('utf8')
    if (ascii.includes('BEGIN CERTIFICATE')) {
      // Handle PEM formatted ICAO bytes
      for (const match of ascii.matchAll(
        /-----BEGIN CERTIFICATE-----[^-]+-----END CERTIFICATE-----/g,
      )) {
        const pec = AsnConvert.parse(decodeDerFromPemBytes(Buffer.from(match[0])), PecCert)
        const pkiCert = pecToPki(pec)

        // Add ALL parsed certificates to certsForEngine, as pkijs needs them to build the chain
        certsForEngine.push(pkiCert)

        // Check if the certificate is self-signed (issuer === subject) to identify trusted roots
        if (pkiCert.issuer.toString() === pkiCert.subject.toString()) {
          trustedRoots.push(pkiCert)
          // logCertDetails(pkiCert, 'ICAO Trusted Root (Self-Signed)')
        } else {
          // logCertDetails(pkiCert, 'ICAO Intermediate/Chain Cert')
        }
      }
    } else {
      // Handle PKD formatted ICAO bytes
      const masterList = PKD.load(Buffer.from(icaoBytes))
      for (const choice of masterList.certificates) {
        if (choice.certificate) {
          const pkiCert = pecToPki(choice.certificate)

          // Add ALL parsed certificates to certsForEngine
          certsForEngine.push(pkiCert)

          // Check if self-signed to identify trusted roots
          if (pkiCert.issuer.toString() === pkiCert.subject.toString()) {
            trustedRoots.push(pkiCert)
            // logCertDetails(pkiCert, 'ICAO Trusted Root (Self-Signed)')
          } else {
            // logCertDetails(pkiCert, 'ICAO Intermediate/Chain Cert')
          }
        }
      }
    }

    // console.log('\n--- All Certificates in certsForEngine ---')
    // certsForEngine.forEach(cert => {
    //   console.log(
    //     `  Subject: ${cert.subject.typesAndValues.map(tv => `${tv.type}=${tv.value.valueBlock.value}`).join(', ')}`,
    //   )
    //   console.log(
    //     `  Issuer: ${cert.issuer.typesAndValues.map(tv => `${tv.type}=${tv.value.valueBlock.value}`).join(', ')}`,
    //   )
    //   logCertDetails(cert, 'Details') // Log full details including extensions
    // })
    // console.log('-------------------------------------------\n')

    if (!trustedRoots.length) {
      throw new Error(
        'No self-signed CSCA certificates identified as trust anchors from ICAO bytes.',
      )
    }

    // console.log(`Slave certificate subject: ${slavePki.subject.toString()}`)
    // console.log(`Slave certificate issuer: ${slavePki.issuer.toString()}`)
    // logCertDetails(slavePki, 'Slave Certificate')

    // console.log(
    //   `Total certificates provided to engine for chain building (certsForEngine): ${certsForEngine.length}`,
    // )
    // console.log(`Total explicitly trusted root certificates (trustedRoots): ${trustedRoots.length}`)

    // Initialize the CertificateChainValidationEngine
    const engine = new CertificateChainValidationEngine({
      certs: certsForEngine, // Contains the slave cert and ALL other ICAO certificates (intermediates and roots)
      trustedCerts: trustedRoots, // Contains only self-signed roots that are explicitly trusted
      crls: [],
      ocsps: [],
      checkDate: new Date(), // Use current date for validity checks
      // Custom findIssuer for detailed logging during chain building
      findIssuer: async (certificate, validationEngine, crypto) => {
        // console.log(`--- findIssuer called for: ${certificate.subject.toString()}`)
        // console.log(`  Looking for issuer: ${certificate.issuer.toString()}`)

        // Use the default findIssuer logic provided by pkijs
        const issuers = await validationEngine.defaultFindIssuer(
          certificate,
          validationEngine,
          crypto,
        )

        if (issuers.length === 0) {
          console.error(
            `  No issuer found for "${certificate.subject.toString()}" within the provided 'certs' pool. Chain building halted.`,
          )
          // console.log('  Issuer we need:', certificate.issuer.toString())
          // console.log('  Checking all certsForEngine for matching subject:')
          // certsForEngine.forEach(c => {
          // console.log(`    Cert Subject: ${c.subject.toString()}`)
          // })
        } else {
          // console.log(
          //   `  Found ${issuers.length} potential issuer(s) for "${certificate.subject.toString()}":`,
          // )
          // issuers.forEach(issuer =>
          //   console.log(`    - Issuer Subject: ${issuer.subject.toString()}`),
          // )
        }
        return issuers
      },
    })

    // console.log('--- Attempting Certificate Chain Validation ---')
    let validationResult
    try {
      validationResult = await engine.verify()
      // console.log('Validation Result:', {
      //   result: validationResult.result,
      //   resultCode: validationResult.resultCode,
      //   resultMessage: validationResult.resultMessage,
      //   certificatePath: validationResult.certificatePath?.map(c => c.subject.toString()),
      // })

      if (validationResult.result) {
        // console.log('Certificate chain validation successful!')
      } else {
        // console.error(
        //   `Certificate chain validation failed: ${validationResult.resultMessage} (Code: ${validationResult.resultCode})`,
        // )
        // // If validation fails, provide more context from the engine's internal state
        // console.log('Certificates provided to engine (certs array):')
        // engine.certs.forEach(c => logCertDetails(c, 'Engine Certs Array'))
        // console.log('Trusted certificates provided to engine (trustedCerts array):')
        // engine.trustedCerts.forEach(c => logCertDetails(c, 'Engine Trusted Certs Array'))
      }
    } catch (error) {
      console.error('An error occurred during chain validation:', error)
      // throw new Error(
      //   `Chain validation error: ${error instanceof Error ? error.message : String(error)}`,
      // )
    }

    // if (!validationResult || !validationResult.result) {
    //   throw new Error('Slave cert does not validate against ICAO roots.')
    // }

    /* 4 ▸ extract RSA modulus from the slave public key ---------------- */
    if (slavePec.tbsCertificate.subjectPublicKeyInfo.algorithm.algorithm !== id_rsaEncryption) {
      throw new Error('Slave public key is not RSA')
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
