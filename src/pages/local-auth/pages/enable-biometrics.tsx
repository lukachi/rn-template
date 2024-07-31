import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { StackActions, useNavigation } from '@react-navigation/native'
import { AuthenticationType } from 'expo-local-authentication'
import { useCallback, useMemo } from 'react'
import { Button, Text, View } from 'react-native'

import { ErrorHandler } from '@/core'
import { AppRouterNames } from '@/route-names'
import { localAuthStore } from '@/store'
import { cn } from '@/theme'
import { UiIcon } from '@/ui'

export default function EnableBiometrics() {
  const biometricTypes = localAuthStore.useLocalAuthStore(state => state.biometricAuthTypes)
  const enableBiometrics = localAuthStore.useLocalAuthStore(state => state.enableBiometrics)
  const disableBiometrics = localAuthStore.useLocalAuthStore(state => state.disableBiometrics)

  const navigation = useNavigation()

  const tryToEnableBiometrics = useCallback(async () => {
    try {
      await enableBiometrics()

      navigation.dispatch(StackActions.replace(AppRouterNames.App.Root))
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
    }
  }, [enableBiometrics, navigation])

  const onSkip = useCallback(() => {
    disableBiometrics()

    navigation.dispatch(StackActions.replace(AppRouterNames.App.Root))
  }, [disableBiometrics, navigation])

  const biometricIcon = useMemo(() => {
    return {
      [AuthenticationType.FINGERPRINT]: (
        <UiIcon componentName='fingerprintIcon' className='size=[50px] text-primaryMain' />
      ),
      [AuthenticationType.FACIAL_RECOGNITION]: (
        <MaterialCommunityIcons name='face-recognition' className='size=[50px] text-primaryMain' />
      ),
      [AuthenticationType.IRIS]: (
        <UiIcon componentName='fingerprintIcon' className='size=[50px] text-primaryMain' />
      ),
    }[biometricTypes[0]]
  }, [biometricTypes])

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
