import '../../tamagui-web.css'

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { ToastProvider, ToastViewport } from '@tamagui/toast'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { TamaguiProvider } from 'tamagui'

import { config } from '../../tamagui.config'
import { CurrentToast } from './CurrentToast'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  if (!interLoaded && !interError) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
      <ToastProvider
        swipeDirection='horizontal'
        duration={6000}
        native={
          [
            /* uncomment the next line to do native toasts on mobile. NOTE: it'll require you making a dev build and won't work with Expo Go */
            // 'mobile'
          ]
        }
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen
              name='(tabs)'
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name='modal'
              options={{
                title: 'Tamagui + Expo',
                presentation: 'modal',
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            />
          </Stack>
        </ThemeProvider>
        <CurrentToast />
        <ToastViewport top='$8' left={0} right={0} />
      </ToastProvider>
    </TamaguiProvider>
  )
}
