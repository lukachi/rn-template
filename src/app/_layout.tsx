// polyfills
// import '@react-native/js-polyfills'
import 'react-native-get-random-values'

import { sleepAsync } from 'expo-dev-launcher/bundle/functions/sleepAsync'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { APIProvider } from '@/api/client'
import { authStore, localAuthStore } from '@/store'
import { AppTheme } from '@/theme'
import { Toasts } from '@/ui'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [isAppInitialized, setIsAppInitialized] = useState(false)
  const [isAppInitializingFailed, setIsAppInitializingFailed] = useState(false)
  const [, setAppInitError] = useState<Error>()
  const isAuthStoreHydrated = authStore.useIsHydrated()
  const isLocalAuthStoreHydrated = localAuthStore.useIsHydrated()
  const initLocalAuthStore = localAuthStore.useInitLocalAuthStore()

  const isStoresHydrated = useMemo(() => {
    return isAuthStoreHydrated && isLocalAuthStoreHydrated
  }, [isAuthStoreHydrated, isLocalAuthStoreHydrated])

  const initApp = async () => {
    console.log('initApp')
    try {
      // verifyInstallation()
      await initLocalAuthStore()
      await sleepAsync(1_000)
      setIsAppInitialized(true)
      await SplashScreen.hideAsync()
      console.log('splash screen hidden')
    } catch (e) {
      setAppInitError(e)
      setIsAppInitializingFailed(true)
    }
  }

  useEffect(() => {
    if (!isStoresHydrated) return

    initApp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStoresHydrated])

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
          <BottomSheetModalProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name='(app)' />
              <Stack.Screen name='(local-auth)' />
              <Stack.Screen name='(auth)' />
            </Stack>
          </BottomSheetModalProvider>
        </APIProvider>
        <Toasts />
      </AppTheme>
    </GestureHandlerRootView>
  )
}
