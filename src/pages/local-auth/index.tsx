import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useState } from 'react'

import type { LocalAuthStackParamsList, RootStackScreenProps } from '@/route-types'
import { localAuthStore, UserActionsInLocalAuth } from '@/store'

import EnableBiometricsScreen from './pages/enable-biometrics'
import EnablePasscodeScreen from './pages/enable-passcode'
import LockscreenScreen from './pages/lockscreen'
import SetPasscodeScreen from './pages/set-passcode'

const Stack = createNativeStackNavigator<LocalAuthStackParamsList>()

export default function LocalAuthLayout({}: RootStackScreenProps<'LocalAuth'>) {
  const [localAuthNextRouteName, setLocalAuthNextRouteName] =
    useState<keyof LocalAuthStackParamsList>()

  localAuthStore.useUserActionsInLocalAuth(action => {
    if (localAuthNextRouteName) return

    setLocalAuthNextRouteName(
      {
        [UserActionsInLocalAuth.NeedToUnlock]: 'Lockscreen',
        [UserActionsInLocalAuth.NeedToEnablePasscode]: 'EnablePasscode',
        [UserActionsInLocalAuth.NeedToEnableBiometrics]: 'EnableBiometrics',
      }[action] as keyof LocalAuthStackParamsList,
    )
  })

  if (!localAuthNextRouteName) return null

  return (
    <Stack.Navigator initialRouteName={localAuthNextRouteName}>
      <Stack.Screen
        name={'EnablePasscode'}
        component={EnablePasscodeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'SetPasscode'}
        component={SetPasscodeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'EnableBiometrics'}
        component={EnableBiometricsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'Lockscreen'}
        component={LockscreenScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}
