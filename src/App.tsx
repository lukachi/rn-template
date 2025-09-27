import './theme/global.css'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { PortalHost } from '@rn-primitives/portal'
import * as SplashScreen from 'expo-splash-screen'
import { kebabCase } from 'lodash'
import { VariableContextProvider } from 'nativewind'
import { useMemo, useState } from 'react'
import { useColorScheme, View } from 'react-native'
import { SystemBars } from 'react-native-edge-to-edge'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { APIProvider } from '@/api/client'
import { AppInitializationErrorBoundary } from '@/common'
import { useSelectedLanguage } from '@/core'
import AppRoutes from '@/routes'
import { localAuthStore } from '@/store'
import { loadSelectedTheme, THEME } from '@/theme'

import Toasts from './ui/Toasts'

loadSelectedTheme()

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [isAppInitialized, setIsAppInitialized] = useState(false)
  const [isAppInitializingFailed, setIsAppInitializingFailed] = useState(false)

  const [appInitError, setAppInitError] = useState<Error>()

  const isLocalAuthStoreHydrated = localAuthStore.useLocalAuthStore(state => state._hasHydrated)
  const initLocalAuthStore = localAuthStore.useInitLocalAuthStore()
  const colorScheme = useColorScheme()

  const { language } = useSelectedLanguage()

  const isStoresHydrated = useMemo(() => {
    return isLocalAuthStoreHydrated
  }, [isLocalAuthStoreHydrated])

  const cssVars = (['light', 'dark'] as const).reduce(
    (acc, scheme) => ({
      ...acc,
      [scheme]: Object.entries(THEME[scheme]).reduce(
        (vars, [key, value]) => ({
          ...vars,
          [`--${kebabCase(key)}`]: value,
        }),
        {} as Record<string, string>,
      ),
    }),
    {} as Record<'light' | 'dark', Record<string, string>>,
  )

  const initApp = async () => {
    try {
      await initLocalAuthStore()
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
      <VariableContextProvider value={colorScheme ? cssVars[colorScheme] : {}}>
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
              <PortalHost />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </VariableContextProvider>
    </View>
  )
}
