import en from './locales/en.json'
import ir from './locales/ir.json'
import ua from './locales/ua.json'

export const resources = {
  en: { translation: { ...en } },
  ir: { translation: { ...ir } },
  ua: { translation: { ...ua } },
}

export type Language = keyof typeof resources;
