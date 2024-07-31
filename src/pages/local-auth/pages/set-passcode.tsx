import { useNavigation } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { Button, ScrollView, Text, View } from 'react-native'

import { ErrorHandler, useSoftKeyboardEffect } from '@/core'
import { LocalAuthRoutesNames } from '@/pages/local-auth/local-auth-routes-names'
import { AppRoutesNames } from '@/root-route-names'
import { BiometricStatuses, localAuthStore } from '@/store'
import { cn } from '@/theme'
import { UiTextField } from '@/ui'

export default function SetPasscode() {
  const [passcode, setPasscode] = useState('')
  const setPasscodeStore = localAuthStore.useLocalAuthStore(state => state.setPasscode)
  const biometricStatus = localAuthStore.useLocalAuthStore(state => state.biometricStatus)

  const navigation = useNavigation()

  useSoftKeyboardEffect()

  const submit = useCallback(async () => {
    if (!passcode) return

    try {
      setPasscodeStore(passcode)

      if (biometricStatus === BiometricStatuses.NotSet) {
        navigation.navigate(LocalAuthRoutesNames.EnableBiometrics) // TODO: replace

        return
      }

      navigation.navigate(AppRoutesNames.App) // TODO: replace
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [biometricStatus, passcode, setPasscodeStore])

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
      }}
      overScrollMode='always'
    >
      <View className={cn('flex-1')}>
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
    </ScrollView>
  )
}
