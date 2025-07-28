import type { ViewProps } from 'react-native'
import { View } from 'react-native'

import { cn, useBottomBarOffset } from '@/theme'

type Props = {
  isBottomBlockShown?: boolean
} & ViewProps

export default function AppContainer({ isBottomBlockShown = false, children, ...rest }: Props) {
  const offset = useBottomBarOffset()

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {/* <UiAnimatedGyroBg className='absolute inset-0' /> */}
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
