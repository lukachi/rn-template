import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { type ClassValue, clsx } from 'clsx'
import React from 'react'
import { Appearance, Platform, useColorScheme } from 'react-native'
import { useMMKVString } from 'react-native-mmkv'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { extendTailwindMerge } from 'tailwind-merge'

import { storage } from '@/core/storage'
import { THEME } from '@/theme/config'

const SELECTED_THEME = 'SELECTED_THEME'
export type ColorSchemeType = 'light' | 'dark' | 'system' // TODO: use from colors.ts

/**
 * this hooks should only be used while selecting the theme
 * This hooks will return the selected theme which is stored in MMKV
 * selectedTheme should be one of the following values 'light', 'dark' or 'system'
 * don't use this hooks if you want to use it to style your component based on the theme use useColorScheme from nativewind instead
 *
 */
export const useSelectedTheme = () => {
  const [theme, _setTheme] = useMMKVString(SELECTED_THEME, storage)

  const setSelectedTheme = React.useCallback(
    (t: ColorSchemeType) => {
      Appearance.setColorScheme(t === 'system' ? null : t)
      _setTheme(t)
    },
    [_setTheme],
  )

  const selectedTheme = (theme ?? 'system') as ColorSchemeType
  return { selectedTheme, setSelectedTheme } as const
}
// to be used in the root file to load the selected theme from MMKV
export const loadSelectedTheme = () => {
  const theme = storage.getString(SELECTED_THEME)

  const toSet = (theme ?? 'system') as ColorSchemeType

  Appearance.setColorScheme(toSet === 'system' ? null : toSet)
}

// TODO: refactoring
export const useAppTheme = () => {
  const color_ = useColorScheme()

  const { selectedTheme } = useSelectedTheme()

  const palette = {
    system: color_ === 'dark' ? THEME.dark : THEME.light,
    light: THEME.light,
    dark: THEME.dark,
  }[selectedTheme]

  return {
    palette,
  }
}

const twMerge = extendTailwindMerge({})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const useAppPaddings = () => {
  return {
    top: 0,
    right: 16,
    bottom: 0,
    left: 16,
  }
}

export const useBottomBarOffset = () => {
  const bottomBarHeight = useBottomTabBarHeight()

  const insets = useSafeAreaInsets()

  const barPaddingTop = Platform.OS === 'ios' ? 16 : 32

  return bottomBarHeight + insets.bottom + barPaddingTop
}
