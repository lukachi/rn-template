import {
  calcWtnsRegisterIdentityUniversalRSA2048,
  calcWtnsRegisterIdentityUniversalRSA4096,
} from '@modules/witnesscalculator'
import get from 'lodash/get'

import { CircuitType } from '../enums'
import { DocType } from '../types'
import { NewEDocument } from './e-document'

export function getDocType(documentCode: string): DocType | null {
  if (documentCode.includes('I')) {
    return DocType.ID
  }

  if (documentCode.includes('P')) {
    return DocType.PASSPORT
  }

  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDocumentIOS(object: any, docType: DocType): NewEDocument {
  return new NewEDocument({
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
    sodBytes: Buffer.from(get(object, 'sod', ''), 'base64'),
    dg1Bytes: Buffer.from(get(object, 'dg1', ''), 'base64'),
    dg15Bytes: Buffer.from(get(object, 'dg15', ''), 'base64'),
    dg11Bytes: Buffer.from(get(object, 'dg11', ''), 'base64'),
    aaSignature: Buffer.from(get(object, 'signature', ''), 'base64'),
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDocumentAndroid(object: any, docType: DocType): NewEDocument {
  return new NewEDocument({
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
    sodBytes: Buffer.from(get(object, 'sod', ''), 'base64'),
    dg1Bytes: Buffer.from(get(object, 'dg1', ''), 'base64'),
    dg15Bytes: Buffer.from(get(object, 'dg15', ''), 'base64'),
    dg11Bytes: Buffer.from(get(object, 'dg11', ''), 'base64'),
    aaSignature: Buffer.from(get(object, 'signature', ''), 'base64'),
  })
}

export function getCircuitType(pubKeySize: number) {
  return {
    2048: CircuitType.RegisterIdentityUniversalRSA2048,
    4096: CircuitType.RegisterIdentityUniversalRSA4096,
  }[pubKeySize]
}

export function getCircuitDetailsByType(circuitType: CircuitType) {
  const circuitDownloadUrl = {
    [CircuitType.RegisterIdentityUniversalRSA2048]:
      'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.1.0-alpha/registerIdentityUniversalRSA2048-download.zip',
    [CircuitType.RegisterIdentityUniversalRSA4096]:
      'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.1.0-alpha/registerIdentityUniversalRSA4096-download.zip',
  }[circuitType]

  const wtnsCalcMethod = {
    [CircuitType.RegisterIdentityUniversalRSA2048]: calcWtnsRegisterIdentityUniversalRSA2048,
    [CircuitType.RegisterIdentityUniversalRSA4096]: calcWtnsRegisterIdentityUniversalRSA4096,
  }[circuitType]

  const circuitTypeCertificatePubKeySize = {
    [CircuitType.RegisterIdentityUniversalRSA2048]: 2048,
    [CircuitType.RegisterIdentityUniversalRSA4096]: 4096,
  }[circuitType]

  return {
    circuitDownloadUrl,
    wtnsCalcMethod,
    circuitTypeCertificatePubKeySize,
  }
}

export const decodeDerFromPemBytes = (bytes: Uint8Array): ArrayBuffer =>
  Buffer.from(
    Buffer.from(bytes)
      .toString('utf8')
      .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
      .replace(/\s+/g, ''),
    'base64',
  ).buffer

export function toPem(buf: ArrayBuffer, header: string): string {
  const body = Buffer.from(buf)
    .toString('base64')
    .replace(/(.{64})/g, '$1\n')
  return `-----BEGIN ${header}-----\n${body}\n-----END ${header}-----\n`
}

export const toDer = (blob: Uint8Array | string): Uint8Array => {
  const str = typeof blob === 'string' ? blob : new TextDecoder().decode(blob)
  if (str.includes('-----BEGIN')) {
    // PEM detected
    const b64 = str
      .replace(/-----BEGIN [^-]+-----/, '')
      .replace(/-----END [^-]+-----/, '')
      .replace(/\s+/g, '')
    return Uint8Array.from(Buffer.from(b64, 'base64'))
  }
  return typeof blob === 'string' ? Uint8Array.from(Buffer.from(str, 'binary')) : blob
}
