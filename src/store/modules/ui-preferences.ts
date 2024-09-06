import { useCallback, useMemo } from 'react'
import type { ImageBackgroundProps, TextProps, ViewProps } from 'react-native'
import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

import { translate } from '@/core'
import { zustandStorage } from '@/store/helpers'
import { useAppTheme } from '@/theme'

export type DocumentCardUi = {
  title: string
  background: ViewProps | ImageBackgroundProps
  foregroundLabels: TextProps
  foregroundValues: TextProps
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
      }),
    ),
    {
      name: 'ui-preferences',
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
    (value: DocumentCardUi) => {
      updateDocumentsCardUi({
        ...documentsCardUi,
        [id]: value,
      })
    },
    [documentsCardUi, id, updateDocumentsCardUi],
  )

  return {
    uiVariants,

    documentCardUi,
    setDocumentCardUi,
  }
}

export const uiPreferencesStore = {
  useUiPreferencesStore,

  useDocumentCardUiPreference,
}
