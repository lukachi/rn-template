import Constants from 'expo-constants'

import type { ClientEnv } from '../env'

export const Config = Constants.expoConfig?.extra as typeof ClientEnv
