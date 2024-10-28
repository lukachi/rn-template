import { useNavigation } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorHandler, translate, useSoftKeyboardEffect } from '@/core'
import type { LocalAuthStackScreenProps } from '@/route-types'
import { BiometricStatuses, localAuthStore } from '@/store'
import { cn } from '@/theme'
import { UiButton, UiNumPad, UiScreenScrollable } from '@/ui'

export default function SetPasscode({}: LocalAuthStackScreenProps<'SetPasscode'>) {
  const [passcode, setPasscode] = useState('')
  const setPasscodeStore = localAuthStore.useLocalAuthStore(state => state.setPasscode)
  const biometricStatus = localAuthStore.useLocalAuthStore(state => state.biometricStatus)

  const navigation = useNavigation()

  const insets = useSafeAreaInsets()

  useSoftKeyboardEffect()

  const submit = useCallback(async () => {
    if (!passcode) return

    try {
      setPasscodeStore(passcode)

      if (biometricStatus === BiometricStatuses.NotSet) {
        navigation.navigate('LocalAuth', {
          screen: 'EnableBiometrics',
        })

        return
      }
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [biometricStatus, navigation, passcode, setPasscodeStore])

  const handleSetPasscode = useCallback((value: string) => {
    if (value.length > 4) return

    setPasscode(value)
  }, [])

  return (
    <UiScreenScrollable
      style={{
        bottom: insets.bottom,
      }}
    >
      <View className={cn('flex-1')}>
        <View className={cn('my-auto flex w-full items-center gap-4 p-5')}>
          <Text className={cn('text-center text-textPrimary typography-h4')}>
            {translate('set-passcode.title')}
          </Text>

          <View className='flex h-[16] flex-row items-center gap-2'>
            {Array.from({ length: passcode.length }).map((_, i) => (
              <View key={i} className='size-[16] rounded-full bg-textPrimary' />
            ))}
          </View>
        </View>

        <View className={cn('flex w-full gap-6 p-5')}>
          <UiNumPad value={passcode} setValue={handleSetPasscode} />
          <UiButton
            title={translate('set-passcode.submit-btn')}
            onPress={submit}
            disabled={!passcode}
          />
        </View>
      </View>
    </UiScreenScrollable>
  )
}
