import { DefaultTheme, type LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Linking from 'expo-linking'
import { useColorScheme, vars } from 'nativewind'
import { View } from 'react-native'

import AppScreen from '@/pages/app'
import AuthScreen from '@/pages/auth'
import LocalAuthScreen from '@/pages/local-auth'
import type { RootStackParamList } from '@/route-types'
import { authStore, localAuthStore } from '@/store'
import { useSelectedTheme } from '@/theme'
import { cssVars, darkPalette, lightPalette } from '@/theme/config'

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
  const { colorScheme } = useColorScheme()

  const { selectedTheme } = useSelectedTheme()

  const themeToSet =
    selectedTheme !== 'system' ? selectedTheme : colorScheme === 'dark' ? `dark` : 'light'

  const cssVarsToSet = vars(cssVars[themeToSet])

  const palette = themeToSet === 'dark' ? darkPalette : lightPalette

  const isAuthorized = authStore.useIsAuthorized()
  const isUserNeedToLocalAuth = localAuthStore.useUserNeedToLocalAuth()

  return (
    <View
      key={themeToSet}
      style={{
        ...cssVarsToSet,
        flex: 1,
      }}
    >
      <NavigationContainer
        linking={linking}
        theme={{
          dark: colorScheme === 'dark',
          colors: {
            primary: palette.primaryMain,
            background: palette.backgroundPrimary,
            card: palette.backgroundPure,
            text: palette.textPrimary,
            border: palette.additionalLayerBorder,
            notification: palette.errorMain,
          },
          fonts: DefaultTheme.fonts,
        }}
      >
        <Stack.Navigator>
          {isAuthorized ? (
            <>
              {isUserNeedToLocalAuth ? (
                <Stack.Screen
                  name={'LocalAuth'}
                  component={LocalAuthScreen}
                  options={{
                    headerShown: false,
                  }}
                />
              ) : (
                <Stack.Screen
                  name={'App'}
                  component={AppScreen}
                  options={{
                    headerShown: false,
                  }}
                />
              )}
            </>
          ) : (
            <Stack.Screen
              name={'Auth'}
              component={AuthScreen}
              options={{
                headerShown: false,
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  )
}
