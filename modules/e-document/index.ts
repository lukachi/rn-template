// Import the native module. On web, it will be resolved to EDocument.web.ts
// and on native platforms to EDocument.ts

import type { Subscription } from 'expo-modules-core'
import { EventEmitter } from 'expo-modules-core'
import { Platform } from 'react-native'

import EDocumentModule from './src/EDocumentModule'
import type { EDocumentModuleEvents } from './src/enums'
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

export async function getSlaveCertificatePem(sod: Uint8Array): Promise<Uint8Array> {
  return await EDocumentModule.getSlaveCertificatePem(new Uint8Array(sod))
}

export async function getSodEncapsulatedContent(sod: Uint8Array): Promise<Uint8Array> {
  return await EDocumentModule.getSodEncapsulatedContent(new Uint8Array(sod))
}

export async function getSodSignedAttributes(sod: Uint8Array): Promise<Uint8Array> {
  return await EDocumentModule.getSodSignedAttributes(new Uint8Array(sod))
}

export async function getSodSignature(sod: Uint8Array): Promise<Uint8Array> {
  return await EDocumentModule.getSodSignature(new Uint8Array(sod))
}

const EDocumentModuleEmitter = new EventEmitter(EDocumentModule)

export function EDocumentModuleListener(
  eventName: EDocumentModuleEvents,
  listener: (payload: unknown) => void,
): Subscription {
  return EDocumentModuleEmitter.addListener(eventName, listener)
}

export function EDocumentModuleRemoveAllListeners(eventName: EDocumentModuleEvents): void {
  EDocumentModuleEmitter.removeAllListeners(eventName)
}

export * from './src/enums'
export * from './src/helpers'
export * from './src/types'
