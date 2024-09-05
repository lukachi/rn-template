import type { ViewProps } from 'react-native'
import { ScrollView, View } from 'react-native'

import { cn } from '@/theme'

export default function UiScreenScrollable({ className, ...rest }: ViewProps) {
  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View {...rest} className={cn('flex flex-1 flex-col', className)} />
      </ScrollView>
    </View>
  )
}
