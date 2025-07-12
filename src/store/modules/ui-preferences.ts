import { useCallback, useMemo } from 'react'
import type { ImageBackgroundProps, TextProps, ViewProps } from 'react-native'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { translate } from '@/core'
import { zustandStorage } from '@/store/helpers'
import { useAppTheme } from '@/theme'
import { PersonDetails } from '@/utils/e-document/e-document'

export type DocumentCardUi = {
  title: string
  background: ViewProps | ImageBackgroundProps
  foregroundLabels: TextProps
  foregroundValues: TextProps

  personalDetailsShown: Partial<keyof PersonDetails>[]

  isBlurred?: boolean
}

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
        clearDocumentsCardUi: () => set({ documentsCardUi: {} }),
      }),
    ),
    {
      name: 'ui-preferences',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),

      partialize: state => ({
        documentsCardUi: state.documentsCardUi,
      }),
    },
  ),
)

const useDocumentCardUiPreference = (id: string) => {
  const { documentsCardUi, updateDocumentsCardUi } = useUiPreferencesStore(state => ({
    documentsCardUi: state.documentsCardUi,
    updateDocumentsCardUi: state.updateDocumentsCardUi,
  }))

  const { palette } = useAppTheme()

  const uiVariants: DocumentCardUi[] = useMemo(() => {
    const defaultPersonalDetailsShown: Array<keyof PersonDetails> = ['nationality']

    return [
      {
        title: translate('ui-preferences.primary'),
        background: {
          style: {
            backgroundColor: palette.backgroundContainer,
          },
        },
        foregroundLabels: {
          style: {
            color: palette.textSecondary,
          },
        },
        foregroundValues: {
          style: {
            color: palette.textPrimary,
          },
        },

        personalDetailsShown: defaultPersonalDetailsShown,
        isBlurred: true,
      },
      {
        title: translate('ui-preferences.secondary'),
        background: {
          style: {
            backgroundColor: palette.baseWhite,
          },
        },
        foregroundLabels: {
          style: {
            color: 'rgba(0, 0, 0, 0.56)',
          },
        },
        foregroundValues: {
          style: {
            color: palette.baseBlack,
          },
        },

        personalDetailsShown: defaultPersonalDetailsShown,
        isBlurred: true,
      },
      {
        title: translate('ui-preferences.tertiary'),
        background: {
          style: {
            backgroundColor: palette.primaryMain,
          },
        },
        foregroundLabels: {
          style: {
            color: 'rgba(255, 255, 255, 0.56)',
          },
        },
        foregroundValues: {
          style: {
            color: palette.baseWhite,
          },
        },

        personalDetailsShown: defaultPersonalDetailsShown,
        isBlurred: true,
      },
      {
        title: translate('ui-preferences.quaternary'),
        background: {
          source: {
            uri: 'https://docs.expo.dev/static/images/tutorial/background-image.png',
          },
          style: {
            borderRadius: 24,
            overflow: 'hidden',
          },
        } as ImageBackgroundProps,
        foregroundLabels: {
          style: {
            color: 'rgba(255, 255, 255, 0.75)',
          },
        },
        foregroundValues: {
          style: {
            color: palette.baseWhite,
          },
        },

        personalDetailsShown: defaultPersonalDetailsShown,
        isBlurred: true,
      },
    ]
  }, [
    palette.backgroundContainer,
    palette.baseBlack,
    palette.baseWhite,
    palette.primaryMain,
    palette.textPrimary,
    palette.textSecondary,
  ])

  const documentCardUi = useMemo<DocumentCardUi>(
    () => documentsCardUi[id] ?? uiVariants[0],
    [uiVariants, documentsCardUi, id],
  )

  const setDocumentCardUi = useCallback(
    (
      value: DocumentCardUi,
      personalDetailsShown?: Array<keyof PersonDetails>,
      isBlurred?: boolean,
    ) => {
      updateDocumentsCardUi({
        ...documentsCardUi,
        [id]: {
          ...value,
          isBlurred: isBlurred ?? documentCardUi.isBlurred,
          personalDetailsShown: personalDetailsShown || documentCardUi.personalDetailsShown,
        },
      })
    },
    [
      documentCardUi.isBlurred,
      documentCardUi.personalDetailsShown,
      documentsCardUi,
      id,
      updateDocumentsCardUi,
    ],
  )

  const personalDetailsShownVariants = useMemo((): Array<keyof PersonDetails> => {
    return ['nationality', 'documentNumber', 'expiryDate']
  }, [])

  const togglePersonalDetailsVisibility = useCallback(
    (key: keyof PersonDetails) => {
      const personalDetailsShown = documentCardUi.personalDetailsShown ?? []

      const newPersonalDetailsShown = personalDetailsShown.includes(key)
        ? personalDetailsShown.filter(item => item !== key)
        : [...personalDetailsShown, key]

      setDocumentCardUi(
        {
          ...documentCardUi,
        },
        newPersonalDetailsShown,
      )
    },
    [documentCardUi, setDocumentCardUi],
  )

  const toggleIsBlurred = useCallback(() => {
    setDocumentCardUi(
      {
        ...documentCardUi,
      },
      undefined,
      !documentCardUi.isBlurred,
    )
  }, [documentCardUi, setDocumentCardUi])

  return {
    uiVariants,
    personalDetailsShownVariants,

    documentCardUi,
    setDocumentCardUi,

    togglePersonalDetailsVisibility,
    toggleIsBlurred,
  }
}

export const uiPreferencesStore = {
  useUiPreferencesStore,

  useDocumentCardUiPreference: useDocumentCardUiPreference,
}
