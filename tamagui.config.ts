import {config as configBase} from '@tamagui/config/v3'
import {createTamagui, createTokens} from 'tamagui'

import type { BaseTheme} from "@/theme";
import {allThemes} from "@/theme";

const tokens = createTokens({
    ...configBase.tokens,

    ...Object.keys(allThemes).reduce((acc, mode) => ({
        ...acc,

        [mode]: Object.entries(allThemes[mode]).reduce((variantAcc, [colorKey, colorValue]) => ({
            ...variantAcc,
            [colorKey]: colorValue,
        }), {})
    }), {}) as Record<keyof typeof allThemes, Record<keyof BaseTheme, string>>,
})

export const config = createTamagui({
    ...configBase,
    tokens: {
        ...configBase.tokens,
        ...tokens,
    },
    themes: {
        ...configBase.themes,
        light: {
            ...configBase.themes.light,
            ...tokens.light,
        },
        dark: {
            ...configBase.themes.dark,
            ...tokens.dark,
        }
    }
})

export default config

export type Conf = typeof config

declare module 'tamagui' {
    interface TamaguiCustomConfig extends Conf {
    }
}
