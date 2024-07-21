import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { AuthenticationType } from 'expo-local-authentication'
import { router } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { Button, Text, View } from 'react-native'

import { ErrorHandler } from '@/core'
import { localAuthStore } from '@/store'
import { cn, useAppTheme } from '@/theme'
import { UiIcon } from '@/ui'

export default function EnableBiometrics() {
  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)
  const enableBiometrics = localAuthStore.useLocalAuthStore(state => state.enableBiometrics)
  const disableBiometrics = localAuthStore.useLocalAuthStore(state => state.disableBiometrics)

  const { palette } = useAppTheme()

  const tryToEnableBiometrics = useCallback(async () => {
    try {
      await enableBiometrics()

      router.replace('(app)')
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [enableBiometrics])

  const onSkip = useCallback(() => {
    disableBiometrics()

    router.replace('(app)')
  }, [disableBiometrics])

  const biometricIcon = useMemo(() => {
    return {
      [AuthenticationType.FINGERPRINT]: (
        <UiIcon componentName='fingerprintIcon' size={50} color={palette.primaryMain} />
      ),
      [AuthenticationType.FACIAL_RECOGNITION]: (
        <MaterialCommunityIcons name='face-recognition' size={50} color={palette.primaryMain} />
      ),
      [AuthenticationType.IRIS]: (
        <UiIcon componentName='fingerprintIcon' size={50} color={palette.primaryMain} />
      ),
    }[biometricTypes[0]]
  }, [biometricTypes, palette.primaryMain])

  return (
    <View className={cn('flex flex-1 items-center justify-center gap-4')}>
      <View className={cn('my-auto flex w-full items-center gap-4 px-5 text-center')}>
        <Text className={cn('text-textPrimary typography-h4')}>Enable Biometric Auth</Text>
        {biometricIcon}
      </View>

      <View className={cn('flex w-full gap-6 p-5')}>
        <Button title='Enable' onPress={tryToEnableBiometrics} />
        <Button title='Skip' onPress={onSkip} />
      </View>
    </View>
  )
}
