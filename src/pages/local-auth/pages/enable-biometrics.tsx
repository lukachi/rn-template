import { AuthenticationType } from 'expo-local-authentication'
import { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'

import { ErrorHandler, translate } from '@/core'
import { type LocalAuthStackScreenProps } from '@/route-types'
import { localAuthStore } from '@/store'
import { cn, useAppTheme } from '@/theme'
import { UiButton, UiIcon } from '@/ui'

export default function EnableBiometrics({}: LocalAuthStackScreenProps<'EnableBiometrics'>) {
  const { palette } = useAppTheme()

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
        <UiIcon customIcon='fingerprintIcon' size={50} color={palette.baseWhite} />
      ),
      [AuthenticationType.FACIAL_RECOGNITION]: (
        <UiIcon
          libIcon='MaterialCommunityIcons'
          name='face-recognition'
          size={50}
          color={palette.baseWhite}
        />
      ),
      [AuthenticationType.IRIS]: (
        <UiIcon customIcon='fingerprintIcon' size={50} color={palette.baseWhite} />
      ),
    }[biometricTypes[0]]
  }, [biometricTypes, palette.baseWhite])

  return (
    <View className={cn('flex flex-1 items-center justify-center gap-4')}>
      <View className={cn('my-auto flex w-full items-center gap-4 px-5 text-center')}>
        <Text className={cn('text-textPrimary typography-h4')}>
          {translate('enable-biometrics.title')}
        </Text>
        <View className='flex size-[120] items-center justify-center rounded-full bg-primaryMain'>
          {biometricIcon}
        </View>
      </View>

      <View className={cn('flex w-full gap-6 p-5')}>
        <UiButton
          title={translate('enable-biometrics.enable-btn')}
          onPress={tryToEnableBiometrics}
        />
        <UiButton title={translate('enable-biometrics.skip-btn')} onPress={onSkip} />
      </View>
    </View>
  )
}
