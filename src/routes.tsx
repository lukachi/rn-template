import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import AppScreen from '@/pages/app'
import AuthScreen from '@/pages/auth'
import LocalAuthScreen from '@/pages/local-auth'
import { AppRoutesNames } from '@/root-route-names'

const Stack = createNativeStackNavigator()

export default function AppRoutes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={AppRoutesNames.App}>
        <Stack.Screen name={AppRoutesNames.App} component={AppScreen} />
        <Stack.Screen name={AppRoutesNames.Auth} component={AuthScreen} />
        <Stack.Screen name={AppRoutesNames.LocalAuth} component={LocalAuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
