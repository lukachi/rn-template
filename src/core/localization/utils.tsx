import type TranslateOptions from 'i18next'
import i18n from 'i18next'
import memoize from 'lodash/memoize'
import { useCallback } from 'react'
import { I18nManager, NativeModules, Platform } from 'react-native'
import { useMMKVString } from 'react-native-mmkv'
import RNRestart from 'react-native-restart'

import { storage } from '@/core/storage'
import { setDayjsLocale } from '@/helpers/formatters'

import type { Language, resources } from './resources'
import type { RecursiveKeyOf } from './types'

type DefaultLocale = typeof resources.en.translation
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>

export const LOCAL = 'local'

export const getLanguage = (): Language => (storage.getString(LOCAL) as Language) || 'en' // 'Marc' getItem<Language | undefined>(LOCAL);

export const translate = memoize(
  (key: TxKeyPath, options = undefined) => i18n.t(key, options) as unknown as string,
  (key: TxKeyPath, options: typeof TranslateOptions) =>
    options ? key + JSON.stringify(options) : key,
)

export const changeLanguage = (lang: Language) => {
  i18n.changeLanguage(lang)
  if (lang === 'ar') {
    I18nManager.allowRTL(true)
    I18nManager.forceRTL(true)
  } else {
    I18nManager.allowRTL(false)
    I18nManager.forceRTL(false)
  }

  setDayjsLocale(lang)

  // TODO: mb remove after fix rtl in ios
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    if (__DEV__) NativeModules.DevSettings?.reload?.()
    else RNRestart.restart()
  } else if (Platform.OS === 'web') {
    window.location.reload()
  }
}

export const useSelectedLanguage = () => {
  const [language, setLang] = useMMKVString(LOCAL)

  const setLanguage = useCallback(
    (lang: Language) => {
      setLang(lang)
      if (lang !== undefined) changeLanguage(lang as Language)
    },
    [setLang],
  )

  return { language: (language as Language) || 'en', setLanguage }
}
