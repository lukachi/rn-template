// Import the native module. On web, it will be resolved to EDocument.web.ts
// and on native platforms to EDocument.ts

import get from 'lodash/get'
import { Platform } from 'react-native'

import EDocumentModule from './src/EDocumentModule'
import type { EDocument } from './src/types'
import { DocType } from './src/types'

export async function scanDocument(
  bacKeyParameters: {
    dateOfBirth: string
    dateOfExpiry: string
    documentNumber: string
  },
  challenge: Uint8Array,
): Promise<EDocument> {
  const eDocumentString = await EDocumentModule.scanDocument(
    JSON.stringify(bacKeyParameters),
    new Uint8Array(challenge),
  )

  const eDocumentJson = JSON.parse(eDocumentString)

  if (Platform.OS === 'ios') {
    return parseDocumentIOS(eDocumentJson)
  } else if (Platform.OS === 'android') {
    return parseDocumentAndroid(eDocumentJson)
  }

  throw new TypeError('Unsupported platform')
}

export function getDocType(documentCode: string): DocType | null {
  if (documentCode.includes('I')) {
    return DocType.ID
  }

  if (documentCode.includes('P')) {
    return DocType.PASSPORT
  }

  return null
}

function parseDocumentIOS(object: any): EDocument {
  const eDocument: EDocument = {
    personDetails: {
      firstName: get(object, 'personDetails.firstName', null),
      lastName: get(object, 'personDetails.lastName', null),
      gender: get(object, 'personDetails.gender', null),
      birthDate: get(object, 'personDetails.dateOfBirth', null),
      expiryDate: get(object, 'personDetails.documentExpiryDate', null),
      documentNumber: get(object, 'personDetails.documentNumber', null),
      nationality: get(object, 'personDetails.nationality', null),
      issuingAuthority: get(object, 'personDetails.issuingAuthority', null),
      passportImageRaw: get(object, 'personDetails.passportImageRaw', null),
    },
    sod: get(object, 'sod', null),
    dg1: get(object, 'dg1', null),
    dg15: get(object, 'dg15', null),
    dg11: get(object, 'dg11', null),
    signature: get(object, 'signature', null),
  }

  return eDocument
}

function parseDocumentAndroid(object: any): EDocument {
  const eDocument: EDocument = {
    personDetails: {
      firstName: get(object, 'firstName', null),
      lastName: get(object, 'lastName', null),
      gender: get(object, 'gender', null),
      birthDate: get(object, 'birthDate', null),
      expiryDate: get(object, 'expiryDate', null),
      documentNumber: get(object, 'documentNumber', null),
      nationality: get(object, 'nationality', null),
      issuingAuthority: get(object, 'issuingAuthority', null),
      passportImageRaw: get(object, 'passportImageRaw', null),
    },
    sod: get(object, 'sod', null),
    dg1: get(object, 'dg1', null),
    dg15: get(object, 'dg15', null),
    dg11: get(object, 'dg11', null),
    signature: get(object, 'signature', null),
  }

  return eDocument
}

export * from './src/types'
