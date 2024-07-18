import { Text, View } from 'react-native'

import { sampleStore } from '@/store'
import { cn } from '@/theme'

export default function Sibling1() {
  const state1 = sampleStore.useSampleStore(state => state.state1)
  const state2 = sampleStore.useSampleStore(state => state.state2)

  const nested = sampleStore.useSampleStore(state => state.nested)

  const getter1 = sampleStore.useState1Getter()
  const getter2 = sampleStore.useState2Getter()

  return (
    <View className={cn('flex gap-4')}>
      <View>
        <Text className={cn('text-textPrimary')}>state1: {state1}</Text>
        <Text className={cn('text-textPrimary')}>state2: {state2}</Text>
        <Text className={cn('text-textPrimary')}>nested: {JSON.stringify(nested)}</Text>
      </View>

      <View>
        <Text className={cn('text-textPrimary')}>getter1: {getter1}</Text>
        <Text className={cn('text-textPrimary')}>getter2: {getter2}</Text>
      </View>
    </View>
  )
}
