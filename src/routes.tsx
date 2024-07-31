import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useColorScheme, vars } from 'nativewind'
import { View } from 'react-native'

import AppScreen from '@/pages/app'
import AuthScreen from '@/pages/auth'
import LocalAuthScreen from '@/pages/local-auth'
import { AppRouterNames } from '@/route-names'
import { useSelectedTheme } from '@/theme'
import { cssVars, darkPalette, lightPalette } from '@/theme/config'

const Stack = createNativeStackNavigator()

// TODO: mv theme to apropriate place
export default function AppRoutes() {
  const { colorScheme } = useColorScheme()

  const { selectedTheme } = useSelectedTheme()

  const themeToSet =
    selectedTheme !== 'system' ? selectedTheme : colorScheme === 'dark' ? `dark` : 'light'

  const cssVarsToSet = vars(cssVars[themeToSet])

  const palette = themeToSet === 'dark' ? darkPalette : lightPalette

  return (
    <View
      key={themeToSet}
      style={{
        ...cssVarsToSet,
        flex: 1,
      }}
    >
      <NavigationContainer
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
        <Stack.Navigator initialRouteName={AppRouterNames.App.Root}>
          <Stack.Screen
            name={AppRouterNames.App.Root}
            component={AppScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name={AppRouterNames.Auth.Root}
            component={AuthScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name={AppRouterNames.LocalAuth.Root}
            component={LocalAuthScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  )
}
