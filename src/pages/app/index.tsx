import { useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { InAppRouteNames } from '@/pages/app/in-app-route-names'
import { AppRoutesNames } from '@/root-route-names'
import { authStore, localAuthStore } from '@/store'

import FetchingScreen from './pages/fetching'
import LocalizationScreen from './pages/localization'
import UiKitScreen from './pages/ui-kit'

const Stack = createNativeStackNavigator()

export default function App() {
  const isAuthorized = authStore.useIsAuthorized()
  const isUserNeedToLocalAuth = localAuthStore.useUserNeedToLocalAuth()

  const navigation = useNavigation()

  // TODO: move to route guards
  if (!isAuthorized) {
    navigation.navigate(AppRoutesNames.Auth)

    return null
  }

  if (isUserNeedToLocalAuth) {
    navigation.navigate(AppRoutesNames.LocalAuth)

    return null
  }

  return (
    <>
      <Stack.Navigator initialRouteName={InAppRouteNames.UiKit}>
        <Stack.Screen
          name={InAppRouteNames.UiKit}
          component={UiKitScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={InAppRouteNames.Fetching}
          component={FetchingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={InAppRouteNames.Localization}
          component={LocalizationScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </>
  )
}
