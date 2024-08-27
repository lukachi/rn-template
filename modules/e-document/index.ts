// Import the native module. On web, it will be resolved to EDocument.web.ts
// and on native platforms to EDocument.ts

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

  return JSON.parse(eDocumentString)
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

export * from './src/types'
