export const lightPalette = {
  commonBlack: '#202020',
  commonWhite: '#FFFFFF',

  primaryDarker: '#8BAC32',
  primaryDark: '#ACD53E',
  primaryMain: '#CDFD4A',
  primaryLight: '#E5FEA1',
  primaryLighter: '#F5FFDB',
  primaryContrastText: '#202020',

  secondaryDarker: '#0C0C0C',
  secondaryDark: '#161616',
  secondaryMain: '#202020',
  secondaryLight: '#D2D2D2',
  secondaryLighter: '#F4F4F4',
  secondaryContrastText: '#FFFFFF',

  successDarker: '#268764',
  successDark: '#2FA77B',
  successMain: '#38C793',
  successLight: '#C7EFE1',
  successLighter: '#EBF9F4',
  successContrastText: '#FFFFFF',

  errorDarker: '#98132C',
  errorDark: '#BB1837',
  errorMain: '#DF1C41',
  errorLight: '#F9D2D9',
  errorLighter: '#FDEFF2',
  errorContrastText: '#FFFFFF',

  warningDarker: '#A4541E',
  warningDark: '#CA6725',
  warningMain: '#F17B2C',
  warningLight: 'rgba(241, 123, 44, 0.1)',
  warningLighter: 'rgba(241, 123, 44, 0.05)',
  warningContrastText: '#FFFFFF',

  textPrimary: '#202020',
  textSecondary: 'rgba(32, 32, 32, 0.56)',
  textPlaceholder: "rgba(32, 32, 32, 0.44)",
  textDisabled: "rgba(32, 32, 32, 0.28)",

  actionActive: "rgba(32, 32, 32, 0.05)",
  actionHover: "rgba(32, 32, 32, 0.1)",
  actionFocus: "rgba(32, 32, 32, 0.15)",
  actionSelected: "rgba(32, 32, 32, 0.05)",
  actionDisabled: "rgba(32, 32, 32, 0.05)",

  backgroundDefault: '#EFEFEF',
  backgroundLight: "rgba(255, 255, 255, 0.7)",
  backgroundPaper: '#FFFFFF',

  divider: "rgba(32, 32, 32, 0.05)",

  additionalLayerBorder: '#FFFFFF',
  additionalPureBlack: '#262626',
}

export type BaseTheme = typeof lightPalette

export const darkPalette: BaseTheme = {
  commonBlack: '#202020',
  commonWhite: '#FFFFFF',

  primaryDarker: '#DDFE84',
  primaryDark: '#D5FD67',
  primaryMain: '#CDFD4A',
  primaryLight: "rgba(205, 253, 74, 1, 0.1)",
  primaryLighter: "rgba(205, 253, 74, 1, 0.05)",
  primaryContrastText: '#202020',

  secondaryDarker: '#676767',
  secondaryDark: '#444444',
  secondaryMain: '#202020',
  secondaryLight: '#1B1B1B',
  secondaryLighter: '#111111',
  secondaryContrastText: '#FFFFFF',

  successDarker: '#78D9B6',
  successDark: '#58D0A4',
  successMain: '#6CF1C1',
  successLight: "rgba(56, 199, 147, 0.1)",
  successLighter: "rgba(56, 199, 147, 0.05)",
  successContrastText: '#FFFFFF',

  errorDarker: '#E9657E',
  errorDark: '#E4405F',
  errorMain: '#F54667',
  errorLight: "rgba(223, 28, 65, 0.1)",
  errorLighter: "rgba(223, 28, 65, 0.05)",
  errorContrastText: '#FFFFFF',

  warningDarker: '#F5A570',
  warningDark: '#F3904E',
  warningMain: '#FDA366',
  warningLight: "rgba(241, 123, 44, 0.1)",
  warningLighter: "rgba(241, 123, 44, 0.05)",
  warningContrastText: '#FFFFFF',

  textPrimary: "rgba(255, 255, 255, 0.9)",
  textSecondary: "rgba(255, 255, 255, 0.56)",
  textPlaceholder: "rgba(255, 255, 255, 0.44)",
  textDisabled: "rgba(255, 255, 255, 0.28)",

  actionActive: "rgba(255, 255, 255, 0.05)",
  actionHover: "rgba(255, 255, 255, 0.1)",
  actionFocus: "rgba(255, 255, 255, 0.15)",
  actionSelected: "rgba(255, 255, 255, 0.05)",
  actionDisabled: "rgba(255, 255, 255, 0.05)",

  backgroundDefault: '#1B1B1B',
  backgroundLight: "rgba(255, 255, 255, 0.05)",
  backgroundPaper: '#272727',

  divider: "rgba(255, 255, 255, 0.05)",

  additionalLayerBorder: "rgba(255, 255, 255, 0.05)",
  additionalPureBlack: "rgba(255, 255, 255, 0.1)",
}

export const allThemes = {
  light: { ...lightPalette },
  dark: { ...darkPalette },
}
