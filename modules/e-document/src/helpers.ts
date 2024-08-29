import get from 'lodash/get'

import { CircuitType } from './enums'
import { DocType, type EDocument } from './types'

export function getDocType(documentCode: string): DocType | null {
  if (documentCode.includes('I')) {
    return DocType.ID
  }

  if (documentCode.includes('P')) {
    return DocType.PASSPORT
  }

  return null
}

export function parseDocumentIOS(object: any, docType: DocType): EDocument {
  const eDocument: EDocument = {
    docType: docType,
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

export function parseDocumentAndroid(object: any, docType: DocType): EDocument {
  const eDocument: EDocument = {
    docType: docType,
    personDetails: {
      firstName: get(object, 'personDetails.primaryIdentifier', null),
      lastName: get(object, 'personDetails.secondaryIdentifier', null),
      gender: get(object, 'personDetails.gender', null),
      birthDate: get(object, 'personDetails.dateOfBirth', null),
      expiryDate: get(object, 'personDetails.dateOfExpiry', null),
      documentNumber: get(object, 'personDetails.documentNumber', null),
      nationality: get(object, 'personDetails.nationality', null),
      issuingAuthority: get(object, 'personDetails.issuingState', null),
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

export function getCircuitType(pubKeySize: number) {
  return {
    2048: CircuitType.RegisterIdentityUniversalRSA2048,
    4096: CircuitType.RegisterIdentityUniversalRSA4096,
  }[pubKeySize]
}
