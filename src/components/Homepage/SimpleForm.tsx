import { Button, Text, TextInput, View } from 'react-native'

import { bus, DefaultBusEvents } from '@/core'
import { cn } from '@/theme'

export default function SimpleForm() {
  return (
    <View className={cn('flex gap-4')}>
      <Text className={cn('text-textPrimary')}>This is the simple form</Text>

      <View className={cn('flex gap-2 rounded-xl border-textPrimary')}>
        <TextInput />
      </View>

      <View className={cn('flex gap-2')}>
        <TextInput />
      </View>

      <View className={cn('flex gap-2')}>
        <TextInput />
      </View>

      <View className={cn('flex gap-2')}>
        <TextInput />
      </View>

      <Button
        title='submit'
        onPress={() => {
          bus.emit(DefaultBusEvents.success, {
            title: 'success submit',
            message: 'Lorem ipsum dolor sit amet concestetur',
          })
        }}
      />
    </View>
  )
}
