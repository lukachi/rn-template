import type { ThemeConfig } from 'tailwindcss/types/config'

// TODO: use reanimated instead
export const keyframes: ThemeConfig['keyframes'] = {
  swing: {
    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
    '50%': { transform: 'translateY(-20%) rotate(-5deg)' },
  },
}

export const animation: ThemeConfig['animation'] = {
  swing: 'swing 3s ease-in-out infinite',
}
