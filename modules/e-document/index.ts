// Import the native module. On web, it will be resolved to EDocument.web.ts
// and on native platforms to EDocument.ts

import EDocumentModule from './src/EDocumentModule'
import type { EDocument } from './src/types'

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

export * from './src/types'
