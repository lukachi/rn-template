// polyfills
// import '@react-native/js-polyfills'
import 'react-native-get-random-values'
import '@/api/interceptors'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { sleepAsync } from 'expo-dev-launcher/bundle/functions/sleepAsync'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { APIProvider } from '@/api/client'
import { useSelectedLanguage } from '@/core'
import AppRoutes from '@/routes'
import { authStore, localAuthStore, walletStore } from '@/store'
import { loadSelectedTheme } from '@/theme'
import { Toasts } from '@/ui'

loadSelectedTheme()

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [isAppInitialized, setIsAppInitialized] = useState(false)
  const [isAppInitializingFailed, setIsAppInitializingFailed] = useState(false)

  const [, setAppInitError] = useState<Error>()

  const isAuthStoreHydrated = authStore.useAuthStore(state => state._hasHydrated)
  const isLocalAuthStoreHydrated = localAuthStore.useLocalAuthStore(state => state._hasHydrated)
  const isWalletStoreHydrated = walletStore.useWalletStore(state => state._hasHydrated)
  const initLocalAuthStore = localAuthStore.useInitLocalAuthStore()

  const { language } = useSelectedLanguage()

  const isStoresHydrated = useMemo(() => {
    return isAuthStoreHydrated && isLocalAuthStoreHydrated && isWalletStoreHydrated
  }, [isAuthStoreHydrated, isLocalAuthStoreHydrated, isWalletStoreHydrated])

  useEffect(() => {
    if (!isStoresHydrated) return

    const initApp = async () => {
      try {
        // verifyInstallation()
        await initLocalAuthStore()
        await sleepAsync(1_000)
        await SplashScreen.hideAsync()
        setIsAppInitialized(true)
      } catch (e) {
        setAppInitError(e)
        setIsAppInitializingFailed(true)
      }
    }

    initApp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStoresHydrated])

  const onLayoutRootView = useCallback(async () => {
    if (isAppInitialized) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync()
    }
  }, [isAppInitialized])

  if (!isAppInitialized || isAppInitializingFailed) {
    return null // TODO: add error boundary
  }

  return (
    <View style={{ flex: 1 }} key={language} onLayout={onLayoutRootView}>
      <GestureHandlerRootView>
        <APIProvider>
          <BottomSheetModalProvider>
            <AppRoutes />
          </BottomSheetModalProvider>
        </APIProvider>
        <Toasts />
      </GestureHandlerRootView>
    </View>
  )
}
