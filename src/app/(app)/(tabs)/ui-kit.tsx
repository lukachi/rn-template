import { Button, Text, View } from 'react-native'

import { cn } from '@/theme'
import { UiBottomSheet, useUiBottomSheet } from '@/ui'

export default function UiKit() {
  const bottomSheet = useUiBottomSheet()

  return (
    <View className={cn('flex-1')}>
      <Button onPress={bottomSheet.present} title='Present Modal' />

      <UiBottomSheet title='Bottom Sheet title' ref={bottomSheet.ref}>
        <Text className={cn('text-textPrimary')}>
          Lorem ipsum dolor sit amet concestetur! Lorem ipsum dolor sit amet concestetur! Lorem
          ipsum dolor sit amet concestetur! Lorem ipsum dolor sit amet concestetur!
        </Text>
      </UiBottomSheet>
    </View>
  )
}
