import { Button, View } from 'react-native'

import { sampleStore } from '@/store'
import { cn } from '@/theme'

export default function Sibling2() {
  const updateState1 = sampleStore.useSampleStore(state => state.updateState1)
  const updateState2 = sampleStore.useSampleStore(state => state.updateState2)

  return (
    <View className={cn('flex gap-4')}>
      <Button
        title='update state1'
        onPress={() => {
          updateState1(Date.now().toString())
        }}
      />
      <Button
        title='update state2'
        onPress={() => {
          updateState2(Date.now().toString())
        }}
      />
    </View>
  )
}
