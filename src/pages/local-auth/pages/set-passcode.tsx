import { useNavigation } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorHandler, useTranslate } from '@/core'
import { BiometricStatuses, localAuthStore } from '@/store/modules/local-auth'
import { cn } from '@/theme/utils'
import { UiButton } from '@/ui/UiButton'
import UiNumPad from '@/ui/UiNumPad'
import UiScreenScrollable from '@/ui/UiScreenScrollable'
import { UiText } from '@/ui/UiText'

import type { LocalAuthStackScreenProps } from '../route-types'

// eslint-disable-next-line no-empty-pattern
export default function SetPasscode({}: LocalAuthStackScreenProps<'SetPasscode'>) {
  const [passcode, setPasscode] = useState('')
  const setPasscodeStore = localAuthStore.useLocalAuthStore(state => state.setPasscode)
  const biometricStatus = localAuthStore.useLocalAuthStore(state => state.biometricStatus)

  const navigation = useNavigation()

  const insets = useSafeAreaInsets()

  const translate = useTranslate()

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
        paddingBottom: insets.bottom,
      }}
      className='bg-background'
    >
      <View className={cn('flex-1')}>
        <View className={cn('my-auto flex w-full items-center gap-4 p-5')}>
          <UiText variant='title-small' className={cn('text-center')}>
            {translate('set-passcode.title')}
          </UiText>

          <View className='flex h-[16] flex-row items-center gap-2'>
            {Array.from({ length: passcode.length }).map((_, i) => (
              <View key={i} className='bg-foreground size-[16] rounded-full' />
            ))}
          </View>
        </View>

        <View className={cn('flex w-full gap-6 p-5')}>
          <UiNumPad value={passcode} setValue={handleSetPasscode} />
          <UiButton onPress={submit} isDisabled={!passcode}>
            {translate('set-passcode.submit-btn')}
          </UiButton>
        </View>
      </View>
    </UiScreenScrollable>
  )
}
