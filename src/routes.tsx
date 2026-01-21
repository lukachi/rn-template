import { DefaultTheme, type LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { PortalHost } from '@rn-primitives/portal'
import * as Linking from 'expo-linking'
import { SystemBars } from 'react-native-edge-to-edge'
import { useCSSVariable } from 'uniwind'

import AppScreen from '@/pages/app'
import AuthScreen from '@/pages/auth'
import LocalAuthScreen from '@/pages/local-auth'
import type { RootStackParamList } from '@/route-types'
import { localAuthStore } from '@/store/modules/local-auth'

import Toasts from './ui/Toasts'

const Stack = createNativeStackNavigator<RootStackParamList>()

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    /* your linking prefixes */
    Linking.createURL('/'),
  ],
  config: {
    /* configuration for matching screens with paths */
    screens: {
      App: 'external',
    },
  },
}

// TODO: mv theme to apropriate place
export default function AppRoutes() {
  const isAuthorized = false // FIXME: hardcoded
  const isUserNeedToLocalAuth = localAuthStore.useUserNeedToLocalAuth()

  const background = useCSSVariable('--background')
  const foreground = useCSSVariable('--foreground')
  const surface = useCSSVariable('--surface')
  const accent = useCSSVariable('--accent')
  const border = useCSSVariable('--border')

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: String(accent),
          background: String(background),
          text: String(foreground),
          card: String(surface),
          border: String(border),
        },
      }}
    >
      <SystemBars style='auto' />

      <Stack.Navigator>
        {isAuthorized ? (
          <>
            {isUserNeedToLocalAuth ? (
              <Stack.Screen
                name='LocalAuth'
                component={LocalAuthScreen}
                options={{
                  headerShown: false,
                }}
              />
            ) : (
              <Stack.Screen
                name='App'
                component={AppScreen}
                options={{
                  headerShown: false,
                }}
              />
            )}
          </>
        ) : (
          <Stack.Screen
            name='Auth'
            component={AuthScreen}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>

      <Toasts />
      <PortalHost />
    </NavigationContainer>
  )
}
