import type { ScrollViewProps, ViewProps } from 'react-native'
import { ScrollView, View } from 'react-native'

import { cn } from '@/theme'

type Props = {
  scrollViewProps?: ScrollViewProps
} & ViewProps

export default function UiScreenScrollable({ scrollViewProps, className, ...rest }: Props) {
  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView
        {...scrollViewProps}
        contentContainerStyle={{
          flexGrow: 1,
          ...(scrollViewProps?.contentContainerStyle as object),
        }}
      >
        <View {...rest} className={cn('flex flex-1 flex-col', className)} />
      </ScrollView>
    </View>
  )
}
