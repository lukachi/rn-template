import type { ThemeConfig } from 'tailwindcss/types/config'

export const spacing: ThemeConfig['spacing'] = new Array(100).fill(0).reduce((acc, _, i) => {
  acc[i] = `${i * 4}px`
  return acc
}, {})
