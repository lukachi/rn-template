import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import * as SplashScreen from 'expo-splash-screen'
import { useMemo, useState } from 'react'
import { View } from 'react-native'
import { SystemBars } from 'react-native-edge-to-edge'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { APIProvider } from '@/api/client'
import { initInterceptors } from '@/api/interceptors'
import { AppInitializationErrorBoundary } from '@/common'
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

  const [appInitError, setAppInitError] = useState<Error>()

  const isAuthStoreHydrated = authStore.useAuthStore(state => state._hasHydrated)
  const isLocalAuthStoreHydrated = localAuthStore.useLocalAuthStore(state => state._hasHydrated)
  const isWalletStoreHydrated = walletStore.useWalletStore(state => state._hasHydrated)
  const initLocalAuthStore = localAuthStore.useInitLocalAuthStore()

  const { language } = useSelectedLanguage()

  const isStoresHydrated = useMemo(() => {
    return isAuthStoreHydrated && isLocalAuthStoreHydrated && isWalletStoreHydrated
  }, [isAuthStoreHydrated, isLocalAuthStoreHydrated, isWalletStoreHydrated])

  const initApp = async () => {
    try {
      // verifyInstallation()
      await initLocalAuthStore()
      initInterceptors()
    } catch (e) {
      setAppInitError(e)
      setIsAppInitializingFailed(true)
    }

    setIsAppInitialized(true)
    await SplashScreen.hideAsync()
  }

  if (isAppInitializingFailed && appInitError) {
    return <AppInitializationErrorBoundary error={appInitError} />
  }

  return (
    <View style={{ flex: 1 }} key={[language, isStoresHydrated].join(';')} onLayout={initApp}>
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <APIProvider>
              <BottomSheetModalProvider>
                <SystemBars style='auto' />
                {isAppInitialized && <AppRoutes />}
              </BottomSheetModalProvider>
            </APIProvider>
            <Toasts />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </View>
  )
}
