// Import the native module. On web, it will be resolved to EDocument.web.ts
// and on native platforms to EDocument.ts

import type { EventSubscription } from 'expo-modules-core'
import { EventEmitter } from 'expo-modules-core'
import { Platform } from 'react-native'

import EDocumentModule from './src/EDocumentModule'
import type { EDocumentModuleEvents } from './src/enums'
import { getDocType, parseDocumentAndroid, parseDocumentIOS } from './src/helpers/misc'
import { NewEDocument } from './src/helpers/e-document'

export async function scanDocument(
  documentCode: string,
  bacKeyParameters: {
    dateOfBirth: string
    dateOfExpiry: string
    documentNumber: string
  },
  challenge: Uint8Array,
): Promise<NewEDocument> {
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

const EDocumentModuleEmitter = new EventEmitter(EDocumentModule)

export function EDocumentModuleListener(
  eventName: EDocumentModuleEvents,
  listener: (payload: unknown) => void,
): EventSubscription {
  // FIXME: add event types for module
  /* eslint-disable-next-line */
  // @ts-ignore
  return EDocumentModuleEmitter.addListener(eventName, listener)
}

export function EDocumentModuleRemoveAllListeners(eventName: EDocumentModuleEvents): void {
  // FIXME: add event types for module
  /* eslint-disable-next-line */
  // @ts-ignore
  EDocumentModuleEmitter.removeAllListeners(eventName)
}

export * from './src/enums'
export * from './src/helpers/misc'
export * from './src/types'
