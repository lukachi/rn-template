import { sleepAsync } from 'expo-dev-launcher/bundle/functions/sleepAsync'
import { Slot, SplashScreen } from 'expo-router'
import { useEffect, useState } from 'react'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AuthProvider } from '@/contexts/AuthProvider'
import { AppTheme } from '@/theme'
import { Toasts } from '@/ui'

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

  return (
    <GestureHandlerRootView>
      <AppTheme>
        <AuthProvider>
          {/*It's imperative that the <Slot /> is mounted before any navigation events are triggered. Otherwise, a runtime error will be thrown.*/}
          <Slot />
        </AuthProvider>

        <Toasts />
      </AppTheme>
    </GestureHandlerRootView>
  )
}
