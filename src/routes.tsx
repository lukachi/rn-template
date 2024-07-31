import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import AppScreen from '@/pages/app'
import AuthScreen from '@/pages/auth'
import LocalAuthScreen from '@/pages/local-auth'
import { AppRouterNames } from '@/route-names'

const Stack = createNativeStackNavigator()

export default function AppRoutes() {
  return (
    <NavigationContainer>
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
  )
}
