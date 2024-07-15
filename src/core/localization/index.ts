import { getLocales } from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { I18nManager } from 'react-native'

import { setDayjsLocale } from '@/helpers/formatters'

import { resources } from './resources'
import { getLanguage } from './utils'
export * from './utils'

const language = getLanguage() || getLocales()[0]

i18n.use(initReactI18next).init({
  resources,
  lng: getLanguage() || getLocales()[0],
  fallbackLng: 'en',
  compatibilityJSON: 'v3', // By default React Native projects does not support Intl

  // allows integrating dynamic values into translations.
  interpolation: {
    escapeValue: false, // escape passed in values to avoid XSS injections
  },
})

// Is it a RTL language?
export const isRTL: boolean = i18n.dir() === 'rtl'

I18nManager.allowRTL(isRTL)
I18nManager.forceRTL(isRTL)

setDayjsLocale(language)

export default i18n
