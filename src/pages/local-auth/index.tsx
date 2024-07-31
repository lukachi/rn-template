import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useState } from 'react'

import { LocalAuthRoutesNames } from '@/pages/local-auth/local-auth-routes-names'
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
        [UserActionsInLocalAuth.NeedToUnlock]: 'lockscreen',
        [UserActionsInLocalAuth.NeedToEnablePasscode]: 'enable-passcode',
        [UserActionsInLocalAuth.NeedToEnableBiometrics]: 'enable-biometrics',
      }[action],
    )
  })

  if (!localAuthNextRouteName) return null

  return (
    <Stack.Navigator initialRouteName={localAuthNextRouteName}>
      <Stack.Screen name={LocalAuthRoutesNames.EnablePasscode} component={EnablePasscodeScreen} />
      <Stack.Screen name={LocalAuthRoutesNames.SetPasscode} component={SetPasscodeScreen} />
      <Stack.Screen
        name={LocalAuthRoutesNames.EnableBiometrics}
        component={EnableBiometricsScreen}
      />
      <Stack.Screen name={LocalAuthRoutesNames.Lockscreen} component={LockscreenScreen} />
    </Stack.Navigator>
  )
}
