import { router } from 'expo-router'
import { useCallback } from 'react'
import { Button, Text, View } from 'react-native'

import { localAuthStore } from '@/store'
import { cn } from '@/theme'

export default function EnablePasscode() {
  const disablePasscode = localAuthStore.useLocalAuthStore(state => state.disablePasscode)

  const onConfirm = useCallback(() => {
    router.push('set-passcode')
  }, [])

  const onSkip = useCallback(() => {
    disablePasscode()

    router.replace('(app)')
  }, [disablePasscode])

  return (
    <View className={cn('flex flex-1 items-center justify-center')}>
      <Text className={cn('my-auto text-textPrimary typography-h4')}>Enable Passcode</Text>

      <View className={cn('flex w-full gap-6 p-5')}>
        <Button title='Enable' onPress={onConfirm} />
        <Button title='Skip' onPress={onSkip} />
      </View>
    </View>
  )
}
