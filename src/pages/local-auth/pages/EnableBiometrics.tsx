import { AuthenticationType } from 'expo-local-authentication'
import { useCallback, useMemo } from 'react'
import { View } from 'react-native'

import { ErrorHandler, useTranslate } from '@/core'
import { type LocalAuthStackScreenProps } from '@/route-types'
import { localAuthStore } from '@/store'
import { cn, useAppTheme } from '@/theme'
import { UiButton } from '@/ui/UiButton'
import UiIcon from '@/ui/UiIcon'
import { UiText } from '@/ui/UiText'

// eslint-disable-next-line no-empty-pattern
export default function EnableBiometrics({}: LocalAuthStackScreenProps<'EnableBiometrics'>) {
  const { palette } = useAppTheme()
  const translate = useTranslate()

  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)
  const enableBiometrics = localAuthStore.useLocalAuthStore(state => state.enableBiometrics)
  const disableBiometrics = localAuthStore.useLocalAuthStore(state => state.disableBiometrics)

  const tryToEnableBiometrics = useCallback(async () => {
    try {
      await enableBiometrics()
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [enableBiometrics])

  const onSkip = useCallback(() => {
    disableBiometrics()
  }, [disableBiometrics])

  const biometricIcon = useMemo(() => {
    return {
      [AuthenticationType.FINGERPRINT]: (
        <UiIcon customIcon='fingerprintIcon' size={50} color={palette.foreground} />
      ),
      [AuthenticationType.FACIAL_RECOGNITION]: (
        <UiIcon
          libIcon='MaterialCommunityIcons'
          name='face-recognition'
          size={50}
          color={palette.foreground}
        />
      ),
      [AuthenticationType.IRIS]: (
        <UiIcon customIcon='fingerprintIcon' size={50} color={palette.foreground} />
      ),
    }[biometricTypes[0]]
  }, [biometricTypes, palette.foreground])

  return (
    <View className={cn('flex flex-1 items-center justify-center gap-4')}>
      <View className={cn('my-auto flex w-full items-center gap-4 px-5 text-center')}>
        <UiText variant='h4' className={cn('')}>
          {translate('enable-biometrics.title')}
        </UiText>
        <View className='bg-primary flex size-[120] items-center justify-center rounded-full'>
          {biometricIcon}
        </View>
      </View>

      <View className={cn('flex w-full gap-6 p-5')}>
        <UiButton onPress={tryToEnableBiometrics}>
          {translate('enable-biometrics.enable-btn')}
        </UiButton>

        <UiButton onPress={onSkip}>{translate('enable-biometrics.skip-btn')}</UiButton>
      </View>
    </View>
  )
}
