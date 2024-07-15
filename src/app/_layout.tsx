import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { sleepAsync } from 'expo-dev-launcher/bundle/functions/sleepAsync'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

import '../../global.css'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [isAppInitialized, setIsAppInitialized] = useState(false)

  const initApp = async () => {
    try {
      await sleepAsync(1_000)
      setIsAppInitialized(true)
      await SplashScreen.hideAsync()
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    initApp()
  }, [])

  if (!isAppInitialized) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name='(tabs)'
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  )
}
