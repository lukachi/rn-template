import type { ViewProps } from 'react-native'
import { View } from 'react-native'

import { cn, useBottomBarOffset } from '@/theme'

type Props = {
  isWithBottomBlock?: boolean
} & ViewProps

export default function AppContainer({ isWithBottomBlock = false, children, ...rest }: Props) {
  const offset = useBottomBarOffset()

  return (
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
      {isWithBottomBlock && (
        <View
          style={{
            height: offset,
            width: '100%',
          }}
        />
      )}
    </View>
  )
}
