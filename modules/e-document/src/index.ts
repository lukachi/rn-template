import NfcManager, { NfcTech, TagEvent } from 'react-native-nfc-manager'
import * as Crypto from 'expo-crypto'
import {
  Certificate,
  CryptoEngine,
  PublicKeyInfo,
  setEngine,
  ContentInfo,
  SignedData,
  Attribute,
  IssuerAndSerialNumber,
  EncapsulatedContentInfo,
} from 'pkijs'
import { ethers } from 'ethers'
import Emittery, { UnsubscribeFunction } from 'emittery'
import { fromBER, OctetString, Set as asn1Set } from 'asn1js'

// Initialize PKI.js with the WebCrypto engine
const crypto = window.crypto || {}
setEngine('expo-crypto', new CryptoEngine({ name: 'expo-crypto', crypto, subtle: crypto.subtle }))

// Document Scan Events
export enum DocumentScanEvents {
  SCAN_STARTED = 'SCAN_STARTED',
  REQUEST_PRESENT_PASSPORT = 'REQUEST_PRESENT_PASSPORT',
  AUTHENTICATING_WITH_PASSPORT = 'AUTHENTICATING_WITH_PASSPORT',
  READING_DATA_GROUP_PROGRESS = 'READING_DATA_GROUP_PROGRESS',
  ACTIVE_AUTHENTICATION = 'ACTIVE_AUTHENTICATION',
  SUCCESSFUL_READ = 'SUCCESSFUL_READ',
  SCAN_ERROR = 'SCAN_ERROR',
  SCAN_STOPPED = 'SCAN_STOPPED',
}

// Document types
export enum DocumentType {
  PASSPORT = 'P',
  ID_CARD = 'I',
  VISA = 'V',
}

// Gender types
export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  UNSPECIFIED = 'X',
}

// BacKey Parameters structure
export interface BacKeyParameters {
  dateOfBirth: string
  dateOfExpiry: string
  documentNumber: string
}

// Person Details structure
export interface PersonDetails {
  secondaryIdentifier?: string
  primaryIdentifier?: string
  gender?: Gender
  dateOfBirth?: string
  dateOfExpiry?: string
  documentNumber?: string
  nationality?: string
  issuingState?: string
  passportImageRaw?: string
}

// EDocument structure
export interface EDocument {
  personDetails?: PersonDetails
  sod?: string
  dg1?: string
  dg15?: string
  dg11?: string
  signature?: string
}

// MRZ Info structure
export interface MRZInfo {
  documentCode: DocumentType
  issuingState: string
  primaryIdentifier: string
  secondaryIdentifier: string
  nationality: string
  documentNumber: string
  dateOfBirth: string
  gender: Gender
  dateOfExpiry: string
  optionalData1?: string
  optionalData2?: string
}

// NFC Document Model structure
export interface NFCDocumentModel {
  mrzInfo?: MRZInfo
  passportImageRaw?: string
  activeAuthenticationSignature?: Uint8Array
  dg1?: Uint8Array
  dg11?: Uint8Array
  dg15?: Uint8Array
  sod?: Uint8Array
}
// SOD File structure matching ICAO 9303 specification
export interface SODFile {
  version: number
  docSigningCertificate: Certificate
  digestAlgorithm: string
  encapContentInfo: EncapsulatedContentInfo
  signerInfos: SignerInfo[]
  encoded: Uint8Array
  eContent: Uint8Array
  encryptedDigest: Uint8Array
}

// Signer Info structure matching ICAO 9303 specification
export interface SignerInfo {
  version: number
  signerID: IssuerAndSerialNumber
  digestAlgorithm: string
  signedAttrs: Attribute[]
  signatureAlgorithm: string
  signature: OctetString
}

// DG File interface for all data groups
export interface DGFile {
  encoded: Uint8Array
  parse(data: Uint8Array): void
}

// DG1 File structure
export interface DG1File extends DGFile {
  mrzInfo: MRZInfo
}

// DG15 File structure
export interface DG15File extends DGFile {
  publicKey: PublicKeyInfo
}

// Face Image Info structure
export interface FaceImageInfo {
  imageLength: number
  imageInputStream: Uint8Array
  mimeType: string
  quality: number
}

// Define document event data types
export type DocumentScanEventData = {
  [DocumentScanEvents.SCAN_STARTED]: undefined
  [DocumentScanEvents.REQUEST_PRESENT_PASSPORT]: undefined
  [DocumentScanEvents.AUTHENTICATING_WITH_PASSPORT]: undefined
  [DocumentScanEvents.READING_DATA_GROUP_PROGRESS]: undefined
  [DocumentScanEvents.ACTIVE_AUTHENTICATION]: undefined
  [DocumentScanEvents.SUCCESSFUL_READ]: undefined
  [DocumentScanEvents.SCAN_ERROR]: Error
  [DocumentScanEvents.SCAN_STOPPED]: undefined
}

// Utility functions
function hexStringToArrayBuffer(hexString: string): Uint8Array {
  return ethers.getBytes('0x' + hexString)
}

function publicKeyToPem(publicKey: ArrayBuffer): string {
  const base64PubKey = Buffer.from(publicKey).toString('base64')
  return `-----BEGIN PUBLIC KEY-----\n${base64PubKey.replace(/(.{64})/g, '$1\n')}\n-----END PUBLIC KEY-----\n`
}

function certificateToPem(certificate: Certificate): string {
  const certDer = certificate.toSchema().toBER(false)
  const base64Cert = Buffer.from(certDer).toString('base64')
  return `-----BEGIN CERTIFICATE-----\n${base64Cert.replace(/(.{64})/g, '$1\n')}\n-----END CERTIFICATE-----\n`
}

/**
 * Calculate SHA-1 hash of the input using expo-crypto
 * @param data The data to hash
 * @returns A Promise that resolves to a Uint8Array containing the hash
 */
async function calculateSha1(data: Uint8Array | string): Promise<Uint8Array> {
  let inputData: string

  if (typeof data === 'string') {
    inputData = data
  } else {
    // Convert Uint8Array to a string that expo-crypto can process
    inputData = Buffer.from(data).toString('binary')
  }

  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA1, inputData)

  // Convert the hex string result to Uint8Array
  return new Uint8Array(hash.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])
}

// TLV parsing functions
function parseTLV(
  buffer: Uint8Array,
  offset = 0,
): { tag: number; length: number; value: Uint8Array; endOffset: number } {
  // Parse tag - can be multi-byte
  let tag = buffer[offset++]

  // Check if tag is in the format that indicates additional tag bytes follow
  if ((tag & 0x1f) === 0x1f) {
    tag = (tag << 8) | buffer[offset++]

    // Continue reading tag bytes as long as bit 7 is set
    while (buffer[offset - 1] & 0x80) {
      tag = (tag << 8) | buffer[offset++]
    }
  }

  // Parse length - can also be multi-byte
  let length = buffer[offset++]

  if (length > 0x7f) {
    const numberOfLengthBytes = length & 0x7f
    length = 0

    for (let i = 0; i < numberOfLengthBytes; i++) {
      length = (length << 8) | buffer[offset++]
    }
  }

  // Extract the value
  const value = buffer.slice(offset, offset + length)
  const endOffset = offset + length

  return { tag, length, value, endOffset }
}

// Utility functions for Triple DES (3DES) encryption needed for BAC
class TripleDES {
  private key: Uint8Array
  private iv: Uint8Array | null

  constructor(key: Uint8Array, iv: Uint8Array | null = null) {
    if (key.length !== 16 && key.length !== 24) {
      throw new Error('Invalid key length for 3DES. Must be 16 or 24 bytes.')
    }
    this.key = key
    this.iv = iv
  }

  private async processDESBlock(
    input: Uint8Array,
    key: Uint8Array,
    encrypt: boolean,
  ): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'DES-CBC', length: 64 },
      false,
      [encrypt ? 'encrypt' : 'decrypt'],
    )

    const zeroIv = new Uint8Array(8).fill(0)

    const result = await crypto.subtle[encrypt ? 'encrypt' : 'decrypt'](
      { name: 'DES-CBC', iv: zeroIv },
      cryptoKey,
      input,
    )

    return new Uint8Array(result)
  }

  private async processBlock(block: Uint8Array, encrypt: boolean): Promise<Uint8Array> {
    if (block.length !== 8) {
      throw new Error('Block size must be 8 bytes')
    }

    const key1 = this.key.slice(0, 8)
    const key2 = this.key.slice(8, 16)
    const key3 = this.key.length === 24 ? this.key.slice(16, 24) : key1

    let result = await this.processDESBlock(block, key1, encrypt)
    result = await this.processDESBlock(result, key2, !encrypt)
    result = await this.processDESBlock(result, key3, encrypt)

    return result
  }

  async encrypt(data: Uint8Array): Promise<Uint8Array> {
    const paddedData = this.padData(data)
    const blocks = Math.ceil(paddedData.length / 8)
    const result = new Uint8Array(blocks * 8)

    let previousBlock = this.iv || new Uint8Array(8).fill(0)

    for (let i = 0; i < blocks; i++) {
      const blockStart = i * 8
      const block = paddedData.slice(blockStart, blockStart + 8)

      const xoredBlock = new Uint8Array(8)
      for (let j = 0; j < 8; j++) {
        xoredBlock[j] = block[j] ^ previousBlock[j]
      }

      const encryptedBlock = await this.processBlock(xoredBlock, true)

      result.set(encryptedBlock, blockStart)
      previousBlock = encryptedBlock
    }

    return result
  }

  async decrypt(data: Uint8Array): Promise<Uint8Array> {
    if (data.length % 8 !== 0) {
      throw new Error('Encrypted data length must be a multiple of 8 bytes')
    }

    const blocks = data.length / 8
    const result = new Uint8Array(data.length)

    let previousBlock = this.iv || new Uint8Array(8).fill(0)

    for (let i = 0; i < blocks; i++) {
      const blockStart = i * 8
      const block = data.slice(blockStart, blockStart + 8)

      const decryptedBlock = await this.processBlock(block, false)

      for (let j = 0; j < 8; j++) {
        result[blockStart + j] = decryptedBlock[j] ^ previousBlock[j]
      }

      previousBlock = block
    }

    return this.removePadding(result)
  }

  private padData(data: Uint8Array): Uint8Array {
    const padLength = 8 - (data.length % 8)
    const paddedData = new Uint8Array(data.length + padLength)
    paddedData.set(data)

    for (let i = data.length; i < paddedData.length; i++) {
      paddedData[i] = padLength
    }

    return paddedData
  }

  private removePadding(data: Uint8Array): Uint8Array {
    const paddingLength = data[data.length - 1]
    if (paddingLength > 8) {
      return data
    }

    for (let i = data.length - paddingLength; i < data.length; i++) {
      if (data[i] !== paddingLength) {
        return data
      }
    }

    return data.slice(0, data.length - paddingLength)
  }
}

async function calculateRetailMAC(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const key1 = key.slice(0, 8)
  const key2 = key.slice(8, 16)

  const paddedData = new Uint8Array(Math.ceil(data.length / 8) * 8)
  paddedData.set(data)

  if (data.length % 8 !== 0) {
    paddedData[data.length] = 0x80
  }

  let cbcMAC = new Uint8Array(8).fill(0)

  const fullBlocks = Math.floor(paddedData.length / 8)
  for (let i = 0; i < fullBlocks - 1; i++) {
    const blockOffset = i * 8
    const block = paddedData.slice(blockOffset, blockOffset + 8)

    const xorBlock = new Uint8Array(8)
    for (let j = 0; j < 8; j++) {
      xorBlock[j] = cbcMAC[j] ^ block[j]
    }

    const des = new TripleDES(new Uint8Array([...key1, ...key1, ...key1]))
    const encryptedBlock = await des.encrypt(xorBlock)
    cbcMAC = new Uint8Array(encryptedBlock)
  }

  const lastBlock = paddedData.slice((fullBlocks - 1) * 8)

  const xorBlock = new Uint8Array(8)
  for (let j = 0; j < 8; j++) {
    xorBlock[j] = cbcMAC[j] ^ lastBlock[j]
  }

  const macKey = new Uint8Array([...key1, ...key2, ...key1])
  const des3 = new TripleDES(macKey)
  const encryptResult = await des3.encrypt(xorBlock)
  cbcMAC = new Uint8Array(encryptResult)

  return cbcMAC
}

// Main EDocument class
export class EDocumentScanner {
  private eventEmitter: Emittery<DocumentScanEventData>
  private isScanning: boolean = false
  private bacKeyParameters?: BacKeyParameters
  private challenge?: Uint8Array

  constructor() {
    this.eventEmitter = new Emittery()
  }

  async on<T extends DocumentScanEvents>(
    event: T,
    listener: (eventData: DocumentScanEventData[T]) => void,
  ): Promise<UnsubscribeFunction> {
    return this.eventEmitter.on(event, listener)
  }

  off<T extends DocumentScanEvents>(
    event: T,
    listener: (eventData: DocumentScanEventData[T]) => void,
  ): void {
    this.eventEmitter.off(event, listener)
  }

  async initialize(): Promise<boolean> {
    try {
      await NfcManager.start()
      return await NfcManager.isEnabled()
    } catch (error) {
      console.error('Failed to initialize NFC:', error)
      return false
    }
  }

  async scanDocument(bacKeyParameters: BacKeyParameters, challengeHex: string): Promise<EDocument> {
    if (this.isScanning) {
      throw new Error('Scan already in progress')
    }

    this.isScanning = true
    this.bacKeyParameters = bacKeyParameters
    this.challenge = new Uint8Array(hexStringToArrayBuffer(challengeHex))

    await this.eventEmitter.emit(DocumentScanEvents.SCAN_STARTED, undefined)
    await this.eventEmitter.emit(DocumentScanEvents.REQUEST_PRESENT_PASSPORT, undefined)

    try {
      await NfcManager.requestTechnology(NfcTech.IsoDep)

      const tag = await NfcManager.getTag()
      if (!tag) {
        throw new Error('No tag found')
      }

      const documentModel = await this.processTag(tag)

      const eDocument = this.convertToEDocument(documentModel)

      await this.eventEmitter.emit(DocumentScanEvents.SUCCESSFUL_READ, undefined)
      return eDocument
    } catch (error) {
      await this.eventEmitter.emit(DocumentScanEvents.SCAN_ERROR, error)
      throw error
    } finally {
      await this.disableScan()
    }
  }

  async disableScan(): Promise<void> {
    if (this.isScanning) {
      try {
        await NfcManager.cancelTechnologyRequest()
      } catch (error) {
        console.error('Error cancelling technology request:', error)
      }
      this.isScanning = false
      await this.eventEmitter.emit(DocumentScanEvents.SCAN_STOPPED, undefined)
    }
  }

  private async processTag(tag: TagEvent): Promise<NFCDocumentModel> {
    if (!this.bacKeyParameters) {
      throw new Error('BAC key parameters not set')
    }

    await this.eventEmitter.emit(DocumentScanEvents.AUTHENTICATING_WITH_PASSPORT, undefined)

    try {
      // Connect to the tag using the tech list from the discovered tag
      // Cast tech types to NfcTech[] or use IsoDep as fallback
      const techTypes = (tag.techTypes?.filter(tech =>
        Object.values(NfcTech).includes(tech as NfcTech),
      ) as NfcTech[]) || [NfcTech.IsoDep]
      await NfcManager.connect(techTypes)

      await this.performBAC(this.bacKeyParameters)

      await this.eventEmitter.emit(DocumentScanEvents.READING_DATA_GROUP_PROGRESS, undefined)

      const dg1 = await this.readEFFile(0x01)
      const mrzInfo = this.parseDG1(dg1)

      const dg2 = await this.readEFFile(0x02)
      const passportImage = this.extractFaceImage(dg2)

      let dg11: Uint8Array | undefined
      try {
        dg11 = await this.readEFFile(0x0b)
      } catch (e) {
        console.log('DG11 not available', e)
      }

      const sod = await this.readEFFile(0x1e)

      let dg15: Uint8Array | undefined
      try {
        dg15 = await this.readEFFile(0x0f)
      } catch (e) {
        console.log('DG15 not available', e)
      }

      await this.eventEmitter.emit(DocumentScanEvents.ACTIVE_AUTHENTICATION, undefined)

      let activeAuthenticationSignature: Uint8Array | undefined
      if (dg15 && this.challenge) {
        try {
          activeAuthenticationSignature = await this.performActiveAuthentication(dg15)
        } catch (e) {
          console.log('Active Authentication failed', e)
        }
      }

      return {
        mrzInfo,
        passportImageRaw: passportImage,
        dg1,
        dg11,
        dg15,
        sod,
        activeAuthenticationSignature,
      }
    } finally {
      await NfcManager.close()
    }
  }

  private async performBAC(bacKey: BacKeyParameters): Promise<void> {
    const documentNumber = bacKey.documentNumber.padEnd(9, '<')
    const dateOfBirth = bacKey.dateOfBirth
    const dateOfExpiry = bacKey.dateOfExpiry

    const mrzInfo =
      documentNumber +
      this.calculateCheckDigit(documentNumber) +
      dateOfBirth +
      this.calculateCheckDigit(dateOfBirth) +
      dateOfExpiry +
      this.calculateCheckDigit(dateOfExpiry)

    // Use our custom calculateSha1 function instead of ethers.sha1
    const kSeed = await calculateSha1(mrzInfo)

    const adjustParity = (key: Uint8Array): Uint8Array => {
      const result = new Uint8Array(key.length)

      for (let i = 0; i < key.length; i++) {
        let val = key[i]
        let bitCount = 0
        for (let j = 0; j < 7; j++) {
          if ((val & 1) === 1) bitCount++
          val >>= 1
        }

        result[i] = bitCount % 2 === 0 ? key[i] | 0x01 : key[i] & 0xfe
      }

      return result
    }

    const dKenc = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      Buffer.from([...kSeed, 0x00, 0x00, 0x00, 0x01]).toString('binary'),
    )
    const kEnc = adjustParity(Buffer.from(dKenc, 'hex').slice(0, 16))

    const dKmac = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      Buffer.from([...kSeed, 0x00, 0x00, 0x00, 0x02]).toString('binary'),
    )
    const kMac = adjustParity(Buffer.from(dKmac, 'hex').slice(0, 16))

    const getChallenge = new Uint8Array([0x00, 0x84, 0x00, 0x00, 0x08])
    const challengeResp = await NfcManager.isoDepHandler.transceive(Array.from(getChallenge))

    if (
      challengeResp.length < 10 ||
      challengeResp[challengeResp.length - 2] !== 0x90 ||
      challengeResp[challengeResp.length - 1] !== 0x00
    ) {
      throw new Error('Failed to get challenge from passport')
    }

    const rndIc = new Uint8Array(challengeResp.slice(0, 8))

    const rndIfd = crypto.getRandomValues(new Uint8Array(8))

    const kIfd = crypto.getRandomValues(new Uint8Array(16))

    const dataToEncrypt = new Uint8Array(32)
    dataToEncrypt.set(rndIfd, 0)
    dataToEncrypt.set(rndIc, 8)
    dataToEncrypt.set(kIfd, 16)

    const tripleDES = new TripleDES(kEnc)
    const encryptedData = await tripleDES.encrypt(dataToEncrypt)

    const mac = await calculateRetailMAC(kMac, encryptedData)

    const externalAuth = new Uint8Array([0x00, 0x82, 0x00, 0x00, 0x28, ...encryptedData, ...mac])

    const authResponse = await NfcManager.isoDepHandler.transceive(Array.from(externalAuth))

    if (
      authResponse.length < 2 ||
      authResponse[authResponse.length - 2] !== 0x90 ||
      authResponse[authResponse.length - 1] !== 0x00
    ) {
      throw new Error('BAC authentication failed')
    }

    console.log('BAC authentication successful')
  }

  private calculateCheckDigit(input: string): string {
    const weights = [7, 3, 1]
    let sum = 0

    for (let i = 0; i < input.length; i++) {
      let value: number
      const char = input[i]

      if (char >= '0' && char <= '9') {
        value = parseInt(char, 10)
      } else if (char >= 'A' && char <= 'Z') {
        value = char.charCodeAt(0) - 'A'.charCodeAt(0) + 10
      } else if (char === '<') {
        value = 0
      } else {
        throw new Error(`Invalid character in MRZ: ${char}`)
      }

      sum += value * weights[i % 3]
    }

    return (sum % 10).toString()
  }

  private async readEFFile(fileId: number): Promise<Uint8Array> {
    const selectEF = new Uint8Array([0x00, 0xa4, 0x02, 0x0c, 0x02, fileId >> 8, fileId & 0xff])
    const selectResponse = await NfcManager.isoDepHandler.transceive(Array.from(selectEF))

    if (
      selectResponse[selectResponse.length - 2] !== 0x90 ||
      selectResponse[selectResponse.length - 1] !== 0x00
    ) {
      throw new Error(`Failed to select file: ${fileId.toString(16)}`)
    }

    let offset = 0
    let data: number[] = []
    let moreBytesToRead = true

    while (moreBytesToRead) {
      const readBinary = new Uint8Array([0x00, 0xb0, (offset >> 8) & 0xff, offset & 0xff, 0xff])

      const response = await NfcManager.isoDepHandler.transceive(Array.from(readBinary))

      const sw1 = response[response.length - 2]
      const sw2 = response[response.length - 1]

      if (sw1 === 0x90 && sw2 === 0x00) {
        const chunk = response.slice(0, -2)
        data = [...data, ...chunk]

        if (chunk.length < 0xff) {
          moreBytesToRead = false
        } else {
          offset += chunk.length
        }
      } else if (sw1 === 0x6c) {
        const exactLength = sw2
        const newReadBinary = new Uint8Array([
          0x00,
          0xb0,
          (offset >> 8) & 0xff,
          offset & 0xff,
          exactLength,
        ])

        const exactResponse = await NfcManager.isoDepHandler.transceive(Array.from(newReadBinary))

        if (
          exactResponse[exactResponse.length - 2] === 0x90 &&
          exactResponse[exactResponse.length - 1] === 0x00
        ) {
          const chunk = exactResponse.slice(0, -2)
          data = [...data, ...chunk]
        }

        moreBytesToRead = false
      } else {
        moreBytesToRead = false
      }
    }

    return new Uint8Array(data)
  }

  private parseDG1(dg1Data: Uint8Array): MRZInfo {
    try {
      const tlv = parseTLV(dg1Data)

      if (tlv.tag !== 0x61) {
        throw new Error(`Invalid DG1 tag: ${tlv.tag.toString(16)}`)
      }

      const mrzTlv = parseTLV(tlv.value)

      if (mrzTlv.tag !== 0x5f1f) {
        throw new Error(`Invalid MRZ tag: ${mrzTlv.tag.toString(16)}`)
      }

      const mrzData = Buffer.from(mrzTlv.value).toString('utf8')

      if (mrzData.length === 88) {
        const line1 = mrzData.substring(0, 44)
        const line2 = mrzData.substring(44, 88)

        const documentCode = line1.substring(0, 1) as DocumentType
        const issuingState = line1.substring(2, 5).replace(/</g, '')
        const fullName = line1.substring(5).replace(/</g, ' ').trim()

        const nameParts = fullName.split('  ')
        const primaryIdentifier = nameParts[0].trim()
        const secondaryIdentifier = nameParts.length > 1 ? nameParts[1].trim() : ''

        const documentNumber = line2.substring(0, 9).replace(/</g, '')
        const nationality = line2.substring(10, 13).replace(/</g, '')
        const dateOfBirth = line2.substring(13, 19)
        const gender = line2.substring(20, 21) as Gender
        const dateOfExpiry = line2.substring(21, 27)
        const optionalData = line2.substring(28, 42).replace(/</g, '')

        return {
          documentCode,
          issuingState,
          primaryIdentifier,
          secondaryIdentifier,
          nationality,
          documentNumber,
          dateOfBirth,
          gender,
          dateOfExpiry,
          optionalData1: optionalData,
        }
      } else {
        throw new Error(`Unsupported MRZ format: length ${mrzData.length}`)
      }
    } catch (error) {
      console.error('Error parsing DG1:', error)
      throw error
    }
  }

  private extractFaceImage(dg2Data: Uint8Array): string {
    try {
      const tlv = parseTLV(dg2Data)

      if (tlv.tag !== 0x75) {
        throw new Error(`Invalid DG2 tag: ${tlv.tag.toString(16)}`)
      }

      const bioDataTlv = parseTLV(tlv.value)

      let offset = 0
      let foundImage = false
      let imageData: Uint8Array | undefined
      let mimeType = ''

      while (offset < bioDataTlv.value.length) {
        const innerTlv = parseTLV(bioDataTlv.value, offset)
        offset = innerTlv.endOffset

        if (innerTlv.tag === 0x5f2e || innerTlv.tag === 0x7f2e) {
          imageData = innerTlv.value
          foundImage = true
          break
        } else if (innerTlv.tag === 0x5f10) {
          mimeType = Buffer.from(innerTlv.value).toString('utf8')
        }
      }

      if (!foundImage || !imageData) {
        throw new Error('No facial image found in DG2')
      }

      if (mimeType.includes('jp2') || mimeType.includes('jpeg2000')) {
        return Buffer.from(imageData).toString('base64')
      } else if (mimeType.includes('wsq')) {
        return Buffer.from(imageData).toString('base64')
      } else {
        return Buffer.from(imageData).toString('base64')
      }
    } catch (error) {
      console.error('Error extracting face image:', error)
      return ''
    }
  }

  private async performActiveAuthentication(dg15: Uint8Array): Promise<Uint8Array> {
    if (!this.challenge) {
      throw new Error('Challenge not set for Active Authentication')
    }

    // Extract public key from DG15 - we'll use this to verify the signature later
    const publicKey = this.extractPublicKeyFromDG15(dg15)
    console.log('Using public key algorithm:', publicKey.algorithm.algorithmId)

    const internalAuthenticate = new Uint8Array([
      0x00,
      0x88,
      0x00,
      0x00,
      this.challenge.length,
      ...this.challenge,
    ])

    const response = await NfcManager.isoDepHandler.transceive(Array.from(internalAuthenticate))

    if (response[response.length - 2] !== 0x90 || response[response.length - 1] !== 0x00) {
      throw new Error('Active Authentication failed')
    }

    const signature = new Uint8Array(response.slice(0, -2))

    // In a complete implementation, we would verify the signature here
    // using the public key extracted from DG15
    // this.verifyActiveAuthenticationSignature(publicKey, this.challenge, signature);

    return signature
  }

  // Add a new method to verify Active Authentication signatures
  private async verifyActiveAuthenticationSignature(
    publicKey: PublicKeyInfo,
    challenge: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    try {
      // Create a crypto key from the public key info
      const algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-1' } }
      const publicKeyData = publicKey.toSchema().toBER(false)

      const cryptoKey = await crypto.subtle.importKey('spki', publicKeyData, algorithm, false, [
        'verify',
      ])

      // Verify the signature
      return await crypto.subtle.verify(algorithm, cryptoKey, signature, challenge)
    } catch (error) {
      console.error('Error verifying Active Authentication signature:', error)
      return false
    }
  }

  private extractPublicKeyFromDG15(dg15: Uint8Array): PublicKeyInfo {
    try {
      const tlv = parseTLV(dg15)

      if (tlv.tag !== 0x6f) {
        throw new Error(`Invalid DG15 tag: ${tlv.tag.toString(16)}`)
      }

      const asn1 = fromBER(tlv.value)
      if (asn1.offset === -1) {
        throw new Error('Failed to parse DG15 ASN.1 structure')
      }

      return new PublicKeyInfo({ schema: asn1.result })
    } catch (error) {
      console.error('Error extracting public key from DG15:', error)
      throw error
    }
  }

  private convertToEDocument(nfcDocumentModel: NFCDocumentModel): EDocument {
    if (!nfcDocumentModel.mrzInfo) {
      throw new Error('MRZ info is missing')
    }

    const personDetails: PersonDetails = {
      secondaryIdentifier: nfcDocumentModel.mrzInfo.secondaryIdentifier,
      primaryIdentifier: nfcDocumentModel.mrzInfo.primaryIdentifier,
      gender: nfcDocumentModel.mrzInfo.gender,
      dateOfBirth: nfcDocumentModel.mrzInfo.dateOfBirth,
      dateOfExpiry: nfcDocumentModel.mrzInfo.dateOfExpiry,
      documentNumber: nfcDocumentModel.mrzInfo.documentNumber,
      nationality: nfcDocumentModel.mrzInfo.nationality,
      issuingState: nfcDocumentModel.mrzInfo.issuingState,
      passportImageRaw: nfcDocumentModel.passportImageRaw,
    }

    return {
      personDetails,
      dg1: nfcDocumentModel.dg1 ? Buffer.from(nfcDocumentModel.dg1).toString('base64') : undefined,
      dg11: nfcDocumentModel.dg11
        ? Buffer.from(nfcDocumentModel.dg11).toString('base64')
        : undefined,
      dg15: nfcDocumentModel.dg15
        ? Buffer.from(nfcDocumentModel.dg15).toString('base64')
        : undefined,
      sod: nfcDocumentModel.sod ? Buffer.from(nfcDocumentModel.sod).toString('base64') : undefined,
      signature: nfcDocumentModel.activeAuthenticationSignature
        ? Buffer.from(nfcDocumentModel.activeAuthenticationSignature).toString('base64')
        : undefined,
    }
  }

  async getPublicKeyPem(sodBase64: string): Promise<string> {
    try {
      const sodBytes = new Uint8Array(Buffer.from(sodBase64, 'base64'))
      const sodFile = this.parseSodFile(sodBytes)

      const publicKey = sodFile.docSigningCertificate.subjectPublicKeyInfo.toSchema().toBER(false)
      return publicKeyToPem(publicKey)
    } catch (error) {
      console.error('Error extracting public key from SOD', error)
      throw error
    }
  }

  async getSlaveCertificatePem(sodBase64: string): Promise<string> {
    try {
      const sodBytes = new Uint8Array(Buffer.from(sodBase64, 'base64'))
      const sodFile = this.parseSodFile(sodBytes)

      return certificateToPem(sodFile.docSigningCertificate)
    } catch (error) {
      console.error('Error extracting certificate from SOD', error)
      throw error
    }
  }

  async getSodEncapsulatedContent(sodBase64: string): Promise<Uint8Array> {
    try {
      const sodBytes = new Uint8Array(Buffer.from(sodBase64, 'base64'))
      const sodFile = this.parseSodFile(sodBytes)

      const encapContent = sodFile.encapContentInfo.eContent
      if (!encapContent) {
        throw new Error('No encapsulated content in SOD')
      }

      return new Uint8Array(encapContent.valueBlock.valueHex)
    } catch (error) {
      console.error('Error extracting encapsulated content from SOD', error)
      throw error
    }
  }

  async getSodSignedAttributes(sodBase64: string): Promise<Uint8Array> {
    try {
      const sodBytes = new Uint8Array(Buffer.from(sodBase64, 'base64'))
      const sodFile = this.parseSodFile(sodBytes)

      if (sodFile.signerInfos.length === 0) {
        throw new Error('No signer info in SOD')
      }

      const signedAttrs = sodFile.signerInfos[0].signedAttrs

      if (signedAttrs.length > 0) {
        const attrSet = new asn1Set({
          value: signedAttrs.map(attr => attr.toSchema()),
        })

        return new Uint8Array(attrSet.toBER(false))
      }

      return new Uint8Array(0)
    } catch (error) {
      console.error('Error extracting signed attributes from SOD', error)
      throw error
    }
  }

  async getSodSignature(sodBase64: string): Promise<Uint8Array> {
    try {
      const sodBytes = new Uint8Array(Buffer.from(sodBase64, 'base64'))
      const sodFile = this.parseSodFile(sodBytes)

      if (sodFile.signerInfos.length === 0 || !sodFile.encryptedDigest) {
        throw new Error('No signature in SOD')
      }

      return sodFile.encryptedDigest
    } catch (error) {
      console.error('Error extracting signature from SOD', error)
      throw error
    }
  }

  async getDG15PubKeyPem(dg15Base64: string): Promise<string> {
    try {
      const dg15Bytes = new Uint8Array(Buffer.from(dg15Base64, 'base64'))
      const publicKey = this.extractPublicKeyFromDG15(dg15Bytes)

      const publicKeyDer = publicKey.toSchema().toBER(false)
      return publicKeyToPem(publicKeyDer)
    } catch (error) {
      console.error('Error extracting public key from DG15', error)
      throw error
    }
  }

  private parseSodFile(sodBytes: Uint8Array): SODFile {
    try {
      const asn1 = fromBER(sodBytes)
      if (asn1.offset === -1) {
        throw new Error('Failed to parse SOD ASN.1 structure')
      }

      const contentInfo = new ContentInfo({ schema: asn1.result })

      const signedData = new SignedData({ schema: contentInfo.content })

      if (signedData.certificates && signedData.certificates.length > 0) {
        const certItem = signedData.certificates[0]
        if (!('tbsCertificate' in certItem)) {
          throw new Error('Invalid certificate type in SOD')
        }
        const docSigningCert = certItem as Certificate

        const signerInfos = signedData.signerInfos || []
        if (signerInfos.length === 0) {
          throw new Error('No signer info in SOD')
        }

        const eContent = signedData.encapContentInfo.eContent
        if (!eContent) {
          throw new Error('No encapsulated content in SOD')
        }

        const signature = signerInfos[0].signature

        const sodFile: SODFile = {
          version: signedData.version,
          docSigningCertificate: docSigningCert,
          digestAlgorithm: signerInfos[0].digestAlgorithm.algorithmId,
          encapContentInfo: signedData.encapContentInfo,
          signerInfos: signerInfos.map(si => ({
            version: si.version,
            signerID: si.sid,
            digestAlgorithm: si.digestAlgorithm.algorithmId,
            signedAttrs: Array.isArray(si.signedAttrs)
              ? si.signedAttrs
              : si.signedAttrs && si.signedAttrs instanceof Array
                ? si.signedAttrs
                : [],
            signatureAlgorithm: si.signatureAlgorithm.algorithmId,
            signature: si.signature,
          })),
          encoded: sodBytes,
          eContent: new Uint8Array(eContent.valueBlock.valueHex),
          encryptedDigest: new Uint8Array(signature.valueBlock.valueHex),
        }

        return sodFile
      } else {
        throw new Error('No certificates found in SOD')
      }
    } catch (error) {
      console.error('Error parsing SOD file:', error)
      throw error
    }
  }
}

const eDocumentScanner = new EDocumentScanner()
export default eDocumentScanner
