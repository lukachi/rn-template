import './global.css'

import { ThemeProvider } from '@react-navigation/native'
import { useColorScheme, vars } from 'nativewind'
import type { PropsWithChildren } from 'react'
import { View } from 'react-native'

import { cssVars, darkPalette, lightPalette } from '@/theme/config'
import { cn, loadSelectedTheme, useSelectedTheme } from '@/theme/utils'

loadSelectedTheme()

export const AppTheme = ({ children }: PropsWithChildren) => {
  const { colorScheme } = useColorScheme()

  const { selectedTheme } = useSelectedTheme()

  const themeToSet =
    selectedTheme !== 'system' ? selectedTheme : colorScheme === 'dark' ? `dark` : 'light'

  const cssVarsToSet = vars(cssVars[themeToSet])

  const palette = themeToSet === 'dark' ? darkPalette : lightPalette

  return (
    <View
      style={{
        ...cssVarsToSet,
        flex: 1,
      }}
      className={themeToSet}
    >
      <ThemeProvider
        value={{
          dark: colorScheme === 'dark',
          colors: {
            primary: palette.primaryMain,
            background: palette.backgroundPrimary,
            card: palette.backgroundPure,
            text: palette.textPrimary,
            border: palette.additionalLayerBorder,
            notification: palette.errorMain,
          },
        }}
      >
        {children}
        {/**
         * This is a hack to load all the classes to be able to use classes imperatively and dynamically
         * could be necessary in dev mode only, not sure yet
         */}
        <View
          className={cn(
            'bg-additionalGradient1 bg-additionalGradient2 hidden bg-additionalInverted bg-additionalLayerBorder bg-additionalPureDark bg-backgroundContainer bg-backgroundPrimary bg-backgroundPure bg-baseBlack bg-baseWhite bg-componentDisabled bg-componentHovered bg-componentPressed bg-componentPrimary bg-componentSelected bg-errorDark bg-errorDarker bg-errorLight bg-errorLighter bg-errorMain bg-primaryDark bg-primaryDarker bg-primaryLight bg-primaryLighter bg-primaryMain bg-secondaryDark bg-secondaryDarker bg-secondaryLight bg-secondaryLighter bg-secondaryMain bg-successDark bg-successDarker bg-successLight bg-successLighter bg-successMain bg-textDisabled bg-textPlaceholder bg-textPrimary bg-textSecondary bg-warningDark bg-warningDarker bg-warningLight bg-warningLighter bg-warningMain typography-h1 typography-h2 typography-h3 typography-h4 typography-h5 typography-h6 typography-subtitle1 typography-subtitle2 typography-subtitle3 typography-subtitle4 typography-subtitle5 typography-body1 typography-body2 typography-body3 typography-body4 typography-buttonLarge typography-buttonMedium typography-buttonSmall typography-caption1 typography-caption2 typography-caption3 typography-overline1 typography-overline2 typography-overline3',
          )}
        />
      </ThemeProvider>
    </View>
  )
}

export * from './utils'
