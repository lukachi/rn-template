import { Button, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { cn } from '@/theme'
import { UiBottomSheet, useUiBottomSheet } from '@/ui'

import { Buttons } from './components'

export default function UiKit() {
  const insets = useSafeAreaInsets()
  const bottomSheet = useUiBottomSheet()

  return (
    <View
      className='flex-1 bg-primaryLighter'
      style={{
        paddingTop: insets.top,
      }}
    >
      <ScrollView>
        <View className={cn('flex-1 gap-10 px-5')}>
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
    </View>
  )
}
