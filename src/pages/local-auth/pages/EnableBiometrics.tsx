import { AuthenticationType } from 'expo-local-authentication'
import { FingerprintIcon, ScanFaceIcon } from 'lucide-react-native'
import { useCallback, useMemo } from 'react'
import { View } from 'react-native'

import { ErrorHandler, useTranslate } from '@/core'
import { type LocalAuthStackScreenProps } from '@/route-types'
import { localAuthStore } from '@/store'
import { cn } from '@/theme'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiButton } from '@/ui/UiButton'
import { UiText } from '@/ui/UiText'

// eslint-disable-next-line no-empty-pattern
export default function EnableBiometrics({}: LocalAuthStackScreenProps<'EnableBiometrics'>) {
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
        <UiLucideIcon as={FingerprintIcon} className='text-foreground size-13' />
      ),
      [AuthenticationType.FACIAL_RECOGNITION]: (
        <UiLucideIcon as={ScanFaceIcon} className='text-foreground size-13' />
      ),
      [AuthenticationType.IRIS]: (
        <UiLucideIcon as={FingerprintIcon} className='text-foreground size-13' />
      ),
    }[biometricTypes[0]]
  }, [biometricTypes])

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
