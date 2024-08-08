import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useState } from 'react'

import { AppRouterNames } from '@/route-names'
import { localAuthStore, UserActionsInLocalAuth } from '@/store'

import EnableBiometricsScreen from './pages/enable-biometrics'
import EnablePasscodeScreen from './pages/enable-passcode'
import LockscreenScreen from './pages/lockscreen'
import SetPasscodeScreen from './pages/set-passcode'

const Stack = createNativeStackNavigator()

export default function LocalAuthLayout() {
  const [localAuthNextRouteName, setLocalAuthNextRouteName] = useState<string>()

  localAuthStore.useUserActionsInLocalAuth(action => {
    if (localAuthNextRouteName) return

    setLocalAuthNextRouteName(
      {
        [UserActionsInLocalAuth.NeedToUnlock]: AppRouterNames.LocalAuth.Lockscreen,
        [UserActionsInLocalAuth.NeedToEnablePasscode]: AppRouterNames.LocalAuth.EnablePasscode,
        [UserActionsInLocalAuth.NeedToEnableBiometrics]: AppRouterNames.LocalAuth.EnableBiometrics,
      }[action],
    )
  })

  if (!localAuthNextRouteName) return null

  return (
    <Stack.Navigator initialRouteName={localAuthNextRouteName}>
      <Stack.Screen
        name={AppRouterNames.LocalAuth.EnablePasscode}
        component={EnablePasscodeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={AppRouterNames.LocalAuth.SetPasscode}
        component={SetPasscodeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={AppRouterNames.LocalAuth.EnableBiometrics}
        component={EnableBiometricsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={AppRouterNames.LocalAuth.Lockscreen}
        component={LockscreenScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}
