import { BlurView } from 'expo-blur'
import type { ViewProps } from 'react-native'
import { View } from 'react-native'

import { cn, useBottomBarOffset } from '@/theme/utils'

type Props = {
  isBottomBlockShown?: boolean
  isBlurredBottom?: boolean
} & ViewProps

export default function AppContainer({
  isBottomBlockShown = false,
  isBlurredBottom = false,
  children,
  ...rest
}: Props) {
  const offset = useBottomBarOffset()

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {/* Content layer */}
      <View
        {...rest}
        style={[
          rest.style,
          {
            flex: 1,
          },
        ]}
      >
        <View className={cn('flex-1')}>{children}</View>
        {isBlurredBottom && (
          <View
            className={cn('absolute bottom-0 w-full bg-transparent')}
            style={{
              height: offset,
            }}
          >
            <BlurView
              experimentalBlurMethod='dimezisBlurView'
              intensity={12}
              className='size-full'
            />
          </View>
        )}
        {isBottomBlockShown && (
          <View
            style={{
              height: offset,
              width: '100%',
            }}
          />
        )}
      </View>
    </View>
  )
}
