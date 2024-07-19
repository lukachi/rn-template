// polyfills
// import '@react-native/js-polyfills'
import 'react-native-get-random-values'

import { sleepAsync } from 'expo-dev-launcher/bundle/functions/sleepAsync'
import { Slot, SplashScreen } from 'expo-router'
import { useEffect, useState } from 'react'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { APIProvider } from '@/api/client'
import { useIsHydrated } from '@/store'
import { AppTheme } from '@/theme'
import { Toasts } from '@/ui'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [isAppInitialized, setIsAppInitialized] = useState(false)
  const [isAppInitializingFailed, setIsAppInitializingFailed] = useState(false)
  const [, setAppInitError] = useState<Error>()
  const isAuthStoreHydrated = useIsHydrated()

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
    if (!isAuthStoreHydrated) return

    initApp()
  }, [isAuthStoreHydrated])

  if (!isAppInitialized) {
    return null
  }

  if (isAppInitializingFailed) {
    return null
  }

  return (
    <GestureHandlerRootView>
      <AppTheme>
        <APIProvider>
          {/*It's imperative that the <Slot /> is mounted before any navigation events are triggered. Otherwise, a runtime error will be thrown.*/}
          <Slot />
        </APIProvider>
        <Toasts />
      </AppTheme>
    </GestureHandlerRootView>
  )
}
