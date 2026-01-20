import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { type ClassValue, clsx } from 'clsx'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const useAppPaddings = () => {
  const insets = useSafeAreaInsets()

  return {
    top: insets.top + 12,
    right: 32,
    bottom: insets.bottom + 12,
    left: 32,
  }
}

export const useBottomBarOffset = () => {
  const bottomBarHeight = useBottomTabBarHeight()

  const insets = useSafeAreaInsets()

  const barPaddingTop = Platform.OS === 'ios' ? 16 : 32

  return bottomBarHeight + insets.bottom + barPaddingTop
}
