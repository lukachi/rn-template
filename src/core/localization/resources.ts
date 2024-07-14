import en from './locales/en.json'
import ar from './locales/ir.json'
import ua from './locales/ua.json'

export const resources = {
  en: { translation: { ...en } },
  ar: { translation: { ...ar } },
  ua: { translation: { ...ua } },
}

export type Language = keyof typeof resources
