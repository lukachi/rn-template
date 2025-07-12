import type { FieldRecords } from 'mrz'
import type { PropsWithChildren } from 'react'
import { useCallback } from 'react'
import { useState } from 'react'
import { createContext, useContext } from 'react'

import { ErrorHandler } from '@/core'
import { tryCatch } from '@/helpers/try-catch'
import { identityStore } from '@/store/modules/identity'
import { PassportRegisteredWithAnotherPKError } from '@/store/modules/identity/errors'
import { IdentityItem } from '@/store/modules/identity/Identity'
import { DocType, EDocument } from '@/utils/e-document/e-document'

import { useRegistration } from './hooks/registration'

export enum Steps {
  SelectDocTypeStep,
  ScanMrzStep,
  ScanNfcStep,
  DocumentPreviewStep,
  GenerateProofStep,
  FinishStep,

  RevocationStep,
}

type DocumentScanContext = {
  identity?: IdentityItem

  currentStep: Steps
  setCurrentStep: (step: Steps) => void

  docType?: DocType
  setDocType: (docType: DocType) => void

  tempMRZ?: FieldRecords
  setTempMrz: (value: FieldRecords) => void
  tempEDoc?: EDocument
  setTempEDoc: (value: EDocument) => void

  createIdentity: () => Promise<void>
  revokeIdentity: () => Promise<void>

  circuitLoadingDetails?: {
    isLoaded: boolean
    isLoadFailed: boolean
    downloadingProgress: string
  }
}

const documentScanContext = createContext<DocumentScanContext>({
  currentStep: Steps.SelectDocTypeStep,

  setCurrentStep: () => {
    throw new Error('setCurrentStep not implemented')
  },

  docType: undefined,
  setDocType: () => {
    throw new Error('setDocType not implemented')
  },
  tempMRZ: undefined,
  setTempMrz: () => {
    throw new Error('setMrz not implemented')
  },

  tempEDoc: undefined,
  setTempEDoc: () => {
    throw new Error('setEDoc not implemented')
  },

  createIdentity: async () => {
    throw new Error('createIdentity not implemented')
  },
  revokeIdentity: async () => {
    throw new Error('revokeIdentity not implemented')
  },
})

export function useDocumentScanContext() {
  return useContext(documentScanContext)
}

export function ScanContextProvider({
  docType,
  children,
}: {
  docType?: DocType
} & PropsWithChildren) {
  const addIdentity = identityStore.useIdentityStore(state => state.addIdentity)

  const [currentStep, setCurrentStep] = useState<Steps>(
    docType ? Steps.ScanMrzStep : Steps.SelectDocTypeStep,
  )
  const [selectedDocType, setSelectedDocType] = useState(docType)

  const [tempMRZ, setTempMRZ] = useState<FieldRecords>()
  const [tempEDoc, setTempEDoc] = useState<EDocument>()

  const [identity, setIdentity] = useState<IdentityItem>()

  const registration = useRegistration()

  const revokeIdentity = useCallback(async () => {
    if (!identity) throw new TypeError('Identity is not set for revocation')

    if (!tempMRZ) throw new TypeError('MRZ is not set for revocation')

    const [, revokeIdentityError] = await tryCatch(registration.revokeIdentity(tempMRZ, identity))
    if (revokeIdentityError) {
      throw new TypeError('Failed to revoke identity after registration error', revokeIdentityError)
    }
  }, [identity, registration, tempMRZ])

  const createIdentity = useCallback(async () => {
    if (!tempEDoc) {
      throw new Error('MRZ or EDocument is not set')
    }

    setCurrentStep(Steps.GenerateProofStep)

    const [identityItem, createIdentityError] = await tryCatch(
      registration.createIdentity(tempEDoc, {
        onRevocation: async identityItem => {
          setIdentity(identityItem)
          setCurrentStep(Steps.RevocationStep)
        },
      }),
    )
    if (createIdentityError) {
      ErrorHandler.processWithoutFeedback(createIdentityError)

      if (createIdentityError instanceof PassportRegisteredWithAnotherPKError) {
        return
      }

      setCurrentStep(Steps.DocumentPreviewStep)
      return
    }

    addIdentity(identityItem)
    setIdentity(identityItem)
    setCurrentStep(Steps.FinishStep)
  }, [addIdentity, registration, tempEDoc])

  // ---------------------------------------------------------------------------------------------

  const handleSetSelectedDocType = useCallback((value: DocType) => {
    setSelectedDocType(value)
    setCurrentStep(Steps.ScanMrzStep)
  }, [])

  const handleSetMrz = useCallback((value: FieldRecords) => {
    setTempMRZ(value)
    setCurrentStep(Steps.ScanNfcStep)
  }, [])

  const handleSetEDoc = useCallback(
    (value: EDocument) => {
      setTempEDoc(value)
      setCurrentStep(Steps.DocumentPreviewStep)
    },
    [setTempEDoc],
  )

  return (
    <documentScanContext.Provider
      value={{
        identity,

        currentStep,
        setCurrentStep,

        docType: selectedDocType,
        setDocType: handleSetSelectedDocType,

        tempMRZ,
        tempEDoc,
        setTempMrz: handleSetMrz,
        setTempEDoc: handleSetEDoc,

        createIdentity,
        revokeIdentity,

        circuitLoadingDetails: registration.circuitLoadingDetails,
      }}
      children={children}
    />
  )
}
