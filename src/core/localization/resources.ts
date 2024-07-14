import ar from './locales/ar.json'
import en from './locales/en.json'
import uk from './locales/uk.json'

export const resources = {
  en: { translation: { ...en } },
  ar: { translation: { ...ar } },
  uk: { translation: { ...uk } },
}

export type Language = keyof typeof resources
