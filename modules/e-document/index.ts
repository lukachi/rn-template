// Import the native module. On web, it will be resolved to EDocument.web.ts
// and on native platforms to EDocument.ts

import { Platform } from 'react-native'

import EDocumentModule from './src/EDocumentModule'
import { getDocType, parseDocumentAndroid, parseDocumentIOS } from './src/helpers'
import type { EDocument } from './src/types'

export async function scanDocument(
  documentCode: string,
  bacKeyParameters: {
    dateOfBirth: string
    dateOfExpiry: string
    documentNumber: string
  },
  challenge: Uint8Array,
): Promise<EDocument> {
  const docType = getDocType(documentCode)

  if (!docType) {
    throw new TypeError('Unsupported document type')
  }

  const eDocumentString = await EDocumentModule.scanDocument(
    JSON.stringify(bacKeyParameters),
    new Uint8Array(challenge),
  )

  const eDocumentJson = JSON.parse(eDocumentString)

  if (Platform.OS === 'ios') {
    return parseDocumentIOS(eDocumentJson, docType)
  } else if (Platform.OS === 'android') {
    return parseDocumentAndroid(eDocumentJson, docType)
  }

  throw new TypeError('Unsupported platform')
}

export async function getPublicKeyPem(sod: Uint8Array): Promise<Uint8Array> {
  return await EDocumentModule.getPublicKeyPem(new Uint8Array(sod))
}

export async function getSlaveCertificatePem(sod: Uint8Array) {
  return await EDocumentModule.getSlaveCertificatePem(new Uint8Array(sod))
}

export * from './src/enums'
export * from './src/helpers'
export * from './src/types'
