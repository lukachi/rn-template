import { BlurView } from 'expo-blur'
import type { ViewProps } from 'react-native'
import { View } from 'react-native'
import tinycolor from 'tinycolor2'

import { cn, useAppTheme } from '@/theme'

export default function UiCard({ children, className, ...rest }: ViewProps) {
  const { palette } = useAppTheme()

  return (
    <View className={cn('relative isolate overflow-hidden rounded-3xl')}>
      <View className='absolute left-0 top-0 z-10 size-full'>
        <BlurView experimentalBlurMethod='dimezisBlurView' intensity={25} className='size-full' />
      </View>
      <View
        {...rest}
        className={cn('z-20 p-4', className)}
        style={{
          backgroundColor: tinycolor(palette.backgroundContainer).setAlpha(0.25).toRgbString(),
        }}
      >
        {children}
      </View>
    </View>
  )
}
