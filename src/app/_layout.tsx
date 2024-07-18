import { sleepAsync } from 'expo-dev-launcher/bundle/functions/sleepAsync'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect, useState } from 'react'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AppTheme } from '@/theme'
import { Toasts } from '@/ui'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [isAppInitialized, setIsAppInitialized] = useState(false)
  const [isAppInitializingFailed, setIsAppInitializingFailed] = useState(false)
  const [, setAppInitError] = useState<Error>()

  const initApp = async () => {
    try {
      // verifyInstallation()
      await sleepAsync(1_000)
      setIsAppInitialized(true)
      await SplashScreen.hideAsync()
    } catch (e) {
      setAppInitError(e)
      setIsAppInitializingFailed(true)
    }
  }

  useEffect(() => {
    initApp()
  }, [])

  if (!isAppInitialized) {
    return null
  }

  if (isAppInitializingFailed) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView>
      <AppTheme>
        <Stack>
          <Stack.Screen
            name='(tabs)'
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name='custom'
            options={{
              headerShown: false,
            }}
          />
        </Stack>

        <Toasts />
      </AppTheme>
    </GestureHandlerRootView>
  )
}
