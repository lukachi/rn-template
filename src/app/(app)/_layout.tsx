import { Redirect, Stack } from 'expo-router'
import { useState } from 'react'

import { authStore, localAuthStore, UserActionsInLocalAuth } from '@/store'

export default function AppLayout() {
  const isAuthorized = authStore.useIsAuthorized()
  const isUserNeedToLocalAuth = localAuthStore.useUserNeedToLocalAuth()
  const [localAuthNextRouteName, setLocalAuthNextRouteName] = useState<string>()

  // due to expo-router difficulties in defining `initialRouteName`, we need to set redirect map here
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

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!isAuthorized) {
    console.log('not authorized')
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href='(auth)' />
  }

  if (isUserNeedToLocalAuth) {
    if (!localAuthNextRouteName) return null

    return <Redirect href={`(local-auth)/${localAuthNextRouteName}`} />
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name='(theme)'
          options={{
            title: 'theme',
          }}
        />
        <Stack.Screen
          name='fetching'
          options={{
            title: 'fetching',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name='localization'
          options={{
            title: 'localization',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  )
}
