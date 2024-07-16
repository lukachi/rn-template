import type { ThemeConfig } from 'tailwindcss/types/config'

export const fontFamily: ThemeConfig['fontFamily'] = {
  'playwrite-cu-extra-light': 'PlaywriteCU-ExtraLight',
  'playwrite-cu-light': 'PlaywriteCU-Light',
  'playwrite-cu-regular': 'PlaywriteCU-Regular',
  'playwrite-cu-thin': 'PlaywriteCU-Thin',
  'roboto-black': 'Roboto-Black',
  'roboto-black-italic': 'Roboto-BlackItalic',
  'roboto-bold': 'Roboto-Bold',
  'roboto-bold-italic': 'Roboto-BoldItalic',
  'roboto-italic': 'Roboto-Italic',
  'roboto-light': 'Roboto-Light',
  'roboto-light-italic': 'Roboto-LightItalic',
  'roboto-medium': 'Roboto-Medium',
  'roboto-medium-italic': 'Roboto-MediumItalic',
  'roboto-regular': 'Roboto-Regular',
  'roboto-thin': 'Roboto-Thin',
  'roboto-thin-italic': 'Roboto-ThinItalic',
}

export const typography = {
  '.typography-h1': {
    fontSize: '96px',
    lineHeight: '96px',
    fontWeight: 700,
  },
  '.typography-h2': { fontSize: '64px', lineHeight: '70px', fontWeight: 700 },
  '.typography-h3': { fontSize: '48px', lineHeight: '56px', fontWeight: 700 },
  '.typography-h4': { fontSize: '32px', lineHeight: '40px', fontWeight: 700 },
  '.typography-h5': { fontSize: '24px', lineHeight: '30px', fontWeight: 700 },
  '.typography-h6': { fontSize: '20px', lineHeight: '24px', fontWeight: 700 },

  '.typography-subtitle1': {
    fontSize: '24px',
    lineHeight: '30px',
    fontWeight: 600,
  },
  '.typography-subtitle2': {
    fontSize: '20px',
    lineHeight: '24px',
    fontWeight: 600,
  },
  '.typography-subtitle3': {
    fontSize: '16px',
    lineHeight: '20px',
    fontWeight: 600,
  },
  '.typography-subtitle4': {
    fontSize: '14px',
    lineHeight: '18px',
    fontWeight: 600,
  },
  '.typography-subtitle5': {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 600,
  },

  '.typography-body1': {
    fontSize: '20px',
    lineHeight: '36px',
    letterSpacing: 0.4,
    fontWeight: 400,
    fontFamily: 'PlaywriteCU-Regular',
  },
  '.typography-body2': {
    fontSize: '16px',
    lineHeight: '20px',
    letterSpacing: 0.32,
    fontWeight: 400,
  },
  '.typography-body3': {
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: 0.28,
    fontWeight: 400,
  },
  '.typography-body4': {
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: 0.24,
    fontWeight: 400,
  },

  '.typography-buttonLarge': {
    fontSize: '16px',
    lineHeight: '20px',
    letterSpacing: 0.32,
    fontWeight: 600,
  },
  '.typography-buttonMedium': {
    fontSize: '14px',
    lineHeight: '18px',
    letterSpacing: 0.28,
    fontWeight: 600,
  },
  '.typography-buttonSmall': {
    fontSize: '12px',
    lineHeight: '14px',
    letterSpacing: 0.24,
    fontWeight: 600,
  },

  '.typography-caption1': {
    fontSize: '14px',
    lineHeight: '18px',
    fontWeight: 500,
  },
  '.typography-caption2': {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
  },
  '.typography-caption3': {
    fontSize: '10px',
    lineHeight: '12px',
    fontWeight: 500,
  },

  '.typography-overline1': {
    fontSize: '14px',
    lineHeight: '18px',
    fontWeight: 700,
    letterSpacing: 0.56,
  },
  '.typography-overline2': {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 700,
    letterSpacing: 0.48,
  },
  '.typography-overline3': {
    fontSize: '10px',
    lineHeight: '12px',
    fontWeight: 700,
    letterSpacing: 0.4,
  },
}
