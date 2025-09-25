import { type LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Linking from 'expo-linking'
import { kebabCase } from 'lodash'
import { VariableContextProvider } from 'nativewind'
import { useColorScheme } from 'react-native'

import AppScreen from '@/pages/app'
import AuthScreen from '@/pages/auth'
import LocalAuthScreen from '@/pages/local-auth'
import type { RootStackParamList } from '@/route-types'
import { localAuthStore } from '@/store'

import { NAV_THEME, THEME } from './theme/config'

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
  const colorScheme = useColorScheme()

  const isAuthorized = true // FIXME
  const isUserNeedToLocalAuth = localAuthStore.useUserNeedToLocalAuth()

  if (!colorScheme) return <></>

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

  return (
    <VariableContextProvider value={cssVars[colorScheme]}>
      <NavigationContainer
        linking={linking}
        theme={NAV_THEME[colorScheme === 'dark' ? 'dark' : 'light']}
      >
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
      </NavigationContainer>
    </VariableContextProvider>
  )
}
