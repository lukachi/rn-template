import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { Button, Text, View } from 'react-native'

import { ErrorHandler } from '@/core'
import { BiometricStatuses, localAuthStore } from '@/store'
import { cn } from '@/theme'
import { UiTextField } from '@/ui'

export default function SetPasscode() {
  const [passcode, setPasscode] = useState('')
  const setPasscodeStore = localAuthStore.useLocalAuthStore(state => state.setPasscode)
  const biometricStatus = localAuthStore.useLocalAuthStore(state => state.biometricStatus)

  const submit = useCallback(async () => {
    if (!passcode) return

    try {
      setPasscodeStore(passcode)

      if (biometricStatus === BiometricStatuses.NotSet) {
        router.replace('/enable-biometrics')

        return
      }

      router.replace('(app)')
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [biometricStatus, passcode, setPasscodeStore])

  return (
    <View className={cn('flex flex-1 items-center justify-center')}>
      <View className={cn('my-auto flex w-full items-center gap-4 p-5')}>
        <Text className={cn('text-center text-textPrimary typography-h4')}>Set Passcode</Text>

        <UiTextField
          placeholder='passcode'
          onChangeText={value => setPasscode(value)}
          inputMode='numeric'
        />
      </View>

      <View className={cn('flex w-full gap-6 p-5')}>
        <Button title='Set' onPress={submit} disabled={!passcode} />
      </View>
    </View>
  )
}
