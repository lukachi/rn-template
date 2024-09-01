import type { DocType, EDocument } from '@modules/e-document'
import type { ZKProof } from '@modules/rapidsnark-wrp'
import type { FieldRecords } from 'mrz'
import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { useCallback } from 'react'
import { useState } from 'react'
import { createContext, useContext } from 'react'
import { Text, View } from 'react-native'

import { bus, DefaultBusEvents } from '@/core'
import { identityStore } from '@/store'

export enum Steps {
  SelectDocTypeStep,
  ScanMrzStep,
  ScanNfcStep,
  DocumentPreviewStep,
  GenerateProofStep,
}

type DocumentScanContext = {
  currentStep: Steps

  docType?: DocType
  setDocType: (docType: DocType) => void

  mrz?: FieldRecords
  setMrz: (mrz: FieldRecords) => void

  eDoc?: EDocument
  setEDoc: (eDoc: EDocument) => void

  createIdentity: () => Promise<void>
  identityCreationProcess: JSX.Element
}

const documentScanContext = createContext<DocumentScanContext>({
  currentStep: Steps.SelectDocTypeStep,

  setMrz: () => {},
  setDocType: () => {},
  setEDoc: () => {},

  createIdentity: async () => {},
  identityCreationProcess: <></>,
})

export function useDocumentScanContext() {
  return useContext(documentScanContext)
}

type Props = {
  docType?: DocType
} & PropsWithChildren

export function ScanContextProvider({ docType, children }: Props) {
  const [currentStep, setCurrentStep] = useState<Steps>(
    docType ? Steps.ScanMrzStep : Steps.SelectDocTypeStep,
  )
  const [selectedDocType, setSelectedDocType] = useState(docType)

  const [mrz, setMrz] = useState<FieldRecords>()

  const [eDoc, setEDoc] = useState<EDocument>()

  const [registrationProof, setRegistrationProof] = useState<ZKProof>()

  const handleSetSelectedDocType = useCallback((value: DocType) => {
    setSelectedDocType(value)
    setCurrentStep(Steps.ScanMrzStep)
  }, [])

  const handleSetMrz = useCallback((value: FieldRecords) => {
    setMrz(value)
    setCurrentStep(Steps.ScanNfcStep)
  }, [])

  const handleSetEDoc = useCallback((value: EDocument) => {
    setEDoc(value)
    setCurrentStep(Steps.DocumentPreviewStep)
  }, [])

  const {
    isCircuitsLoaded,
    isCircuitsLoadFailed,
    circuitsDownloadingProgress,

    registerIdentity,
  } = identityStore.useIdentityRegistration()

  const createIdentity = useCallback(async () => {
    if (!eDoc) return

    setCurrentStep(Steps.GenerateProofStep)

    try {
      // TODO: add revocation
      const regProof = await registerIdentity(eDoc)
      setRegistrationProof(regProof)
    } catch (error) {
      console.log(error)
      bus.emit(DefaultBusEvents.error, {
        message: 'Failed to register identity',
      })
      setCurrentStep(Steps.DocumentPreviewStep)
    }
  }, [eDoc, registerIdentity])

  const identityCreationProcess = useMemo(() => {
    return (
      <View>
        <Text className={'text-textPrimary typography-subtitle4'}>Downloading Progress:</Text>
        <Text className={'text-textPrimary typography-body3'}>{circuitsDownloadingProgress}</Text>

        <Text className={'text-textPrimary typography-subtitle4'}>isLoaded:</Text>
        <Text className={'text-textPrimary typography-body3'}>{String(isCircuitsLoaded)}</Text>

        <Text className={'text-textPrimary typography-subtitle4'}>isCircuitsLoadFailed:</Text>
        <Text className={'text-textPrimary typography-body3'}>{String(isCircuitsLoadFailed)}</Text>
      </View>
    )
  }, [circuitsDownloadingProgress, isCircuitsLoadFailed, isCircuitsLoaded])

  return (
    <documentScanContext.Provider
      value={{
        currentStep,

        docType: selectedDocType,
        setDocType: handleSetSelectedDocType,

        mrz,
        setMrz: handleSetMrz,

        eDoc,
        setEDoc: handleSetEDoc,

        createIdentity,
        identityCreationProcess,
      }}
      children={children}
    />
  )
}
