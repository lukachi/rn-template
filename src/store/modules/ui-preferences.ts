import { useCallback, useMemo } from 'react'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { zustandStorage } from '@/store/helpers'

type DocumentCardUi = {
  // TODO: add image support
  background: string
  foregroundLabels: string
  foregroundValues: string
}

const DOCUMENT_CARD_UI_VARIANTS: DocumentCardUi[] = [
  {
    background: '#000000',
    foregroundLabels: 'rgba(255, 255, 255, 0.56)',
    foregroundValues: '#ffffff',
  },
  {
    background: '#ffffff',
    foregroundLabels: 'rgba(0, 0, 0, 0.56)',
    foregroundValues: '#000000',
  },
  {
    background: '#ff0000',
    foregroundLabels: 'rgba(255, 255, 255, 0.56)',
    foregroundValues: '#ffffff',
  },
]

const useUiPreferencesStore = create(
  persist(
    combine(
      {
        documentsCardUi: {} as Record<string, DocumentCardUi>,
      },
      set => ({
        updateDocumentsCardUi: (value: Record<string, DocumentCardUi>) =>
          set(state => ({
            ...state,
            documentsCardUi: value,
          })),
      }),
    ),
    {
      name: 'ui-preferences',
      storage: createJSONStorage(() => zustandStorage),

      partialize: state => ({ documentsCardUi: state.documentsCardUi }),
    },
  ),
)

const useDocumentCardUiPreference = (id: string) => {
  const { documentsCardUi, updateDocumentsCardUi } = useUiPreferencesStore(state => ({
    documentsCardUi: state.documentsCardUi,
    updateDocumentsCardUi: state.updateDocumentsCardUi,
  }))

  const documentCardUi = useMemo<DocumentCardUi>(
    () => documentsCardUi[id] ?? DOCUMENT_CARD_UI_VARIANTS[0],
    [documentsCardUi, id],
  )

  const setDocumentCardUi = useCallback(
    (value: DocumentCardUi) => {
      updateDocumentsCardUi({
        ...documentsCardUi,
        [id]: value,
      })
    },
    [documentsCardUi, id, updateDocumentsCardUi],
  )

  return {
    uiVariants: DOCUMENT_CARD_UI_VARIANTS,

    documentCardUi,
    setDocumentCardUi,
  }
}

export const uiPreferencesStore = {
  useUiPreferencesStore,

  useDocumentCardUiPreference,
}
