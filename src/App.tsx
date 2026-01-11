import '../global.css'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import * as SplashScreen from 'expo-splash-screen'
import { HeroUINativeProvider } from 'heroui-native'
import { type PropsWithChildren } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { APIProvider } from '@/api/client'
import AppRoutes from '@/routes'
import { localAuthStore } from '@/store/modules/local-auth'
import { UiSpinner } from '@/ui/UISpinner'

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <KeyboardProvider>
          <APIProvider>
            <BottomSheetModalProvider>
              <HeroUINativeProvider>
                <StoresHydrationGuard>
                  <AppRoutes />
                </StoresHydrationGuard>
              </HeroUINativeProvider>
            </BottomSheetModalProvider>
          </APIProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

export function StoresHydrationGuard({ children }: PropsWithChildren) {
  const isLocalAuthStoreHydrated = localAuthStore.useLocalAuthStore(s => s._hasHydrated)

  const initLocalAuth = localAuthStore.useInitLocalAuthStore()

  const { isSuccess: isLocalAuthInitialized } = useQuery({
    queryKey: ['init-local-auth'],
    enabled: isLocalAuthStoreHydrated, // 1. Wait for store hydration
    staleTime: Infinity,
    queryFn: async () => {
      try {
        await initLocalAuth()
        SplashScreen.hideAsync()
        return true
      } catch {
        return false
      }
    },
  })

  const isReady = isLocalAuthStoreHydrated && isLocalAuthInitialized

  if (!isReady) {
    return (
      <View className='bg-background flex-1 items-center justify-center'>
        <UiSpinner className='text-accent h-10 w-10' />
      </View>
    )
  }

  return children
}
