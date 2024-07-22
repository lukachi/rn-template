import { Button, ScrollView, Text, View } from 'react-native'

import { cn } from '@/theme'
import { UiBottomSheet, useUiBottomSheet } from '@/ui'

import { Buttons } from './components'

export default function UiKit() {
  const bottomSheet = useUiBottomSheet()

  return (
    <ScrollView>
      <View className={cn('flex-1 gap-10 p-5')}>
        <Buttons />

        <Button onPress={bottomSheet.present} title='Present Modal' />

        <UiBottomSheet title='Bottom Sheet title' ref={bottomSheet.ref}>
          <Text className={cn('text-textPrimary')}>
            Lorem ipsum dolor sit amet concestetur! Lorem ipsum dolor sit amet concestetur! Lorem
            ipsum dolor sit amet concestetur! Lorem ipsum dolor sit amet concestetur!
          </Text>
        </UiBottomSheet>
      </View>
    </ScrollView>
  )
}
