import { NoirCircuitParams, NoirZKProof } from '@modules/noir'
import { RSAPublicKey } from '@peculiar/asn1-rsa'
import { getBytes, toBigInt, zeroPadBytes } from 'ethers'
import { Platform } from 'react-native'

import { tryCatch } from '@/helpers/try-catch'
import { EPassport } from '@/utils/e-document/e-document'
import { extractPubKey } from '@/utils/e-document/helpers/misc'

import {
  EIDBasedRegistrationCircuit,
  EPassportBasedRegistrationCircuit,
  RegistrationCircuit,
} from './registration-circuit'

export class NoirEPassportBasedRegistrationCircuit extends EPassportBasedRegistrationCircuit {
  constructor(public eDoc: EPassport) {
    super(eDoc)
  }

  static computeBarretReduction(nBits: number, n: bigint): bigint {
    return BigInt(2) ** BigInt(2 * nBits) / n
  }

  public get noirCircuitParams(): NoirCircuitParams {
    return NoirCircuitParams.fromName(this.prefixName)
  }

  public get chunkedParams() {
    const defaultChunkedParams = super.chunkedParams

    const pubKey = extractPubKey(
      this.eDoc.sod.slaveCertificate.certificate.tbsCertificate.subjectPublicKeyInfo,
    )

    let reduction: string[] = []

    if (pubKey instanceof RSAPublicKey) {
      const unpaddedModulus = new Uint8Array(
        pubKey.modulus[0] === 0x00 ? pubKey.modulus.slice(1) : pubKey.modulus,
      )

      reduction = RegistrationCircuit.splitBigIntToChunks(
        120,
        defaultChunkedParams.chunk_number,
        NoirEPassportBasedRegistrationCircuit.computeBarretReduction(
          unpaddedModulus.length * 4 + 2,
          toBigInt(unpaddedModulus),
        ),
      )
    }

    reduction = RegistrationCircuit.splitBigIntToChunks(120, defaultChunkedParams.chunk_number, 0n)

    return { ...super.chunkedParams, reduction }
  }

  async prove(params: {
    skIdentity: bigint
    icaoRoot: bigint
    inclusionBranches: bigint[]
  }): Promise<NoirZKProof> {
    await NoirCircuitParams.downloadTrustedSetup()

    const byteCode = await this.noirCircuitParams.downloadByteCode()

    const inputs = {
      dg1: this.eDoc.dg1Bytes,
      dg15: this.eDoc.dg15Bytes,
      ec: this.eDoc.sod.encapsulatedContent,
      sa: this.eDoc.sod.signedAttributes,

      pk: this.chunkedParams.pk_chunked,
      reduction: this.chunkedParams.reduction,
      sig: this.chunkedParams.sig_chunked,

      sk_identity: params.skIdentity,
      icao_root: params.icaoRoot,
      inclusion_branches: params.inclusionBranches,
    }

    return this.noirCircuitParams.prove(JSON.stringify(inputs), byteCode)
  }
}

export class NoirEIDBasedRegistrationCircuit extends EIDBasedRegistrationCircuit {
  public get noirCircuitParams(): NoirCircuitParams {
    return NoirCircuitParams.fromName('registerIdentity_inid_ca')
  }

  async prove(params: {
    skIdentity: bigint
    icaoRoot: bigint
    inclusionBranches: bigint[]
  }): Promise<NoirZKProof> {
    await NoirCircuitParams.downloadTrustedSetup()

    const byteCode = await this.noirCircuitParams.downloadByteCode()

    const tbsInput =
      Platform.OS === 'ios'
        ? Array.from(getBytes(zeroPadBytes(new Uint8Array(this.tbsRaw), 1200))).map(String)
        : Array.from(getBytes(zeroPadBytes(new Uint8Array(this.tbsRaw), 1200)))

    let pk = RegistrationCircuit.splitBigIntToChunks(120, 18, toBigInt(this.pubKey))

    if (Platform.OS === 'android') {
      pk = pk.map(el => `0x${BigInt(el).toString(16)}`)
    }

    let reduction = RegistrationCircuit.splitBigIntToChunks(
      120,
      18,
      NoirEPassportBasedRegistrationCircuit.computeBarretReduction(2048 + 2, toBigInt(this.pubKey)),
    )

    if (Platform.OS === 'android') {
      reduction = reduction.map(el => `0x${BigInt(el).toString(16)}`)
    }

    let signature = RegistrationCircuit.splitBigIntToChunks(
      120,
      18,
      toBigInt(new Uint8Array(this.eID.sigCertificate.certificate.signatureValue)),
    )

    if (Platform.OS === 'android') {
      signature = signature.map(el => `0x${BigInt(el).toString(16)}`)
    }

    let len = String(this.tbsRaw.byteLength)

    if (Platform.OS === 'android') {
      len = `0x${BigInt(len).toString(16)}`
    }

    let icao_root = String(params.icaoRoot)

    if (Platform.OS === 'android') {
      icao_root = `0x${BigInt(icao_root).toString(16)}`
    }

    let inclusion_branches = params.inclusionBranches.map(String)

    if (Platform.OS === 'android') {
      inclusion_branches = inclusion_branches.map(el => `0x${BigInt(el).toString(16)}`)
    }

    let skIdentity = String(params.skIdentity)

    if (Platform.OS === 'android') {
      skIdentity = `0x${BigInt(skIdentity).toString(16)}`
    }

    const inputs = {
      tbs: tbsInput,
      pk: pk,
      reduction: reduction,
      len: len,
      signature: signature,
      icao_root: icao_root,
      inclusion_branches: inclusion_branches,
      sk_identity: skIdentity,
    }

    const [proof, getProofError] = await tryCatch(
      this.noirCircuitParams.prove(JSON.stringify(inputs), byteCode),
    )
    if (getProofError) {
      throw getProofError
    }

    return proof
  }
}
