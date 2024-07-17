import { kebabCase } from 'lodash'
import type { ThemeConfig } from 'tailwindcss/types/config'

const getRgba = (hex: string, opacity: number) => {
  const hexValue = hex.replace('#', '')
  const r = parseInt(hexValue.substring(0, 2), 16)
  const g = parseInt(hexValue.substring(2, 4), 16)
  const b = parseInt(hexValue.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export const lightPalette = {
  baseBlack: '#000000',
  baseWhite: '#ffffff',

  primaryDarker: '#0a4c3d',
  primaryDark: '#0d5847',
  primaryMain: '#136854',
  primaryLight: '#b4efe1',
  primaryLighter: '#dafef5',

  secondaryDarker: '#c897e6',
  secondaryDark: '#d9aef3',
  secondaryMain: '#e7c1fe',
  secondaryLight: '#f5e3ff',
  secondaryLighter: '#faf2ff',

  successDarker: '#268764',
  successDark: '#2fa77b',
  successMain: '#38c793',
  successLight: '#c7efe1',
  successLighter: '#ebf9f4',

  errorDarker: '#98132c',
  errorDark: '#bb1837',
  errorMain: '#df1c41',
  errorLight: '#f9d2d9',
  errorLighter: '#fdeff2',

  warningDarker: '#a4541e',
  warningDark: '#ca6725',
  warningMain: '#f17b2c',
  warningLight: getRgba('#F17B2C', 0.1),
  warningLighter: getRgba('#F17B2C', 0.05),

  textPrimary: '#000000',
  textSecondary: getRgba('#000000', 0.56),
  textPlaceholder: getRgba('#000000', 0.44),
  textDisabled: getRgba('#000000', 0.28),

  componentPrimary: getRgba('#000000', 0.05),
  componentHovered: getRgba('#000000', 0.1),
  componentPressed: getRgba('#000000', 0.15),
  componentSelected: getRgba('#000000', 0.05),
  componentDisabled: getRgba('#000000', 0.05),

  backgroundPrimary: '#f5f6f6',
  backgroundContainer: '#ffffff',
  backgroundPure: '#ffffff',

  additionalLayerBorder: '#ffffff',
  additionalPureDark: '#000000',
  additionalInverted: '#ffffff',
}

export type BaseTheme = typeof lightPalette

export const darkPalette: BaseTheme = {
  baseBlack: '#202020',
  baseWhite: '#FFFFFF',

  primaryDarker: '#30967E',
  primaryDark: '#24826C',
  primaryMain: '#1C715D',
  primaryLight: getRgba('#1C715D', 0.1),
  primaryLighter: getRgba('#1C715D', 0.05),

  secondaryDarker: '#934ABF',
  secondaryDark: '#A057CC',
  secondaryMain: '#A972CA',
  secondaryLight: getRgba('#A972CA', 0.1),
  secondaryLighter: getRgba('#A972CA', 0.05),

  successDarker: '#78D9B6',
  successDark: '#58D0A4',
  successMain: '#69DBB1',
  successLight: getRgba('#38C793', 0.1),
  successLighter: getRgba('#38C793', 0.05),

  errorDarker: '#E9657E',
  errorDark: '#E4405F',
  errorMain: '#F54667',
  errorLight: getRgba('#DF1C41', 0.1),
  errorLighter: getRgba('#DF1C41', 0.05),

  warningDarker: '#F5A570',
  warningDark: '#F3904E',
  warningMain: '#FDA366',
  warningLight: getRgba('#F17B2C', 0.1),
  warningLighter: getRgba('#F17B2C', 0.05),

  textPrimary: getRgba('#FFFFFF', 0.9),
  textSecondary: getRgba('#FFFFFF', 0.56),
  textPlaceholder: getRgba('#FFFFFF', 0.44),
  textDisabled: getRgba('#FFFFFF', 0.28),

  componentPrimary: getRgba('#FFFFFF', 0.05),
  componentHovered: getRgba('#FFFFFF', 0.1),
  componentPressed: getRgba('#FFFFFF', 0.15),
  componentSelected: getRgba('#FFFFFF', 0.05),
  componentDisabled: getRgba('#FFFFFF', 0.05),

  backgroundPrimary: '#111111',
  backgroundContainer: '#272727',
  backgroundPure: '#272727',

  additionalLayerBorder: getRgba('#FFFFFF', 0.05),
  additionalPureDark: getRgba('#FFFFFF', 0.1),
  additionalInverted: '#444444',
}

export const cssVars = {
  light: Object.entries(lightPalette).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [`--${kebabCase(key)}`]: value,
    }),
    {} as Record<string, string>,
  ),
  dark: Object.entries(darkPalette).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [`--${kebabCase(key)}`]: value,
    }),
    {} as Record<string, string>,
  ),
}

export const colorsScheme: BaseTheme = {
  baseBlack: 'var(--base-black)',
  baseWhite: 'var(--base-white)',

  primaryDarker: 'var(--primary-darker)',
  primaryDark: 'var(--primary-dark)',
  primaryMain: 'var(--primary-main)',
  primaryLight: 'var(--primary-light)',
  primaryLighter: 'var(--primary-lighter)',

  secondaryDarker: 'var(--secondary-darker)',
  secondaryDark: 'var(--secondary-dark)',
  secondaryMain: 'var(--secondary-main)',
  secondaryLight: 'var(--secondary-light)',
  secondaryLighter: 'var(--secondary-lighter)',

  successDarker: 'var(--success-darker)',
  successDark: 'var(--success-dark)',
  successMain: 'var(--success-main)',
  successLight: 'var(--success-light)',
  successLighter: 'var(--success-lighter)',

  errorDarker: 'var(--error-darker)',
  errorDark: 'var(--error-dark)',
  errorMain: 'var(--error-main)',
  errorLight: 'var(--error-light)',
  errorLighter: 'var(--error-lighter)',

  warningDarker: 'var(--warning-darker)',
  warningDark: 'var(--warning-dark)',
  warningMain: 'var(--warning-main)',
  warningLight: 'var(--warning-light)',
  warningLighter: 'var(--warning-lighter)',

  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textPlaceholder: 'var(--text-placeholder)',
  textDisabled: 'var(--text-disabled)',

  componentPrimary: 'var(--component-primary)',
  componentHovered: 'var(--component-hovered)',
  componentPressed: 'var(--component-pressed)',
  componentSelected: 'var(--component-selected)',
  componentDisabled: 'var(--component-disabled)',

  backgroundPrimary: 'var(--background-primary)',
  backgroundContainer: 'var(--background-container)',
  backgroundPure: 'var(--background-pure)',

  additionalLayerBorder: 'var(--additional-layer-border)',
  additionalPureDark: 'var(--additional-pure-dark)',
  additionalInverted: 'var(--additional-inverted)',
}

export const colors: ThemeConfig['colors'] = colorsScheme
