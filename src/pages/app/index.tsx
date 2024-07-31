import { StackActions, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { AppRouterNames } from '@/route-names'
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
    navigation.dispatch(StackActions.replace(AppRouterNames.Auth.Root))

    return null
  }

  if (isUserNeedToLocalAuth) {
    navigation.dispatch(StackActions.replace(AppRouterNames.LocalAuth.Root))

    return null
  }

  return (
    <>
      <Stack.Navigator initialRouteName={AppRouterNames.App.UiKit.Root}>
        <Stack.Screen
          name={AppRouterNames.App.UiKit.Root}
          component={UiKitScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={AppRouterNames.App.Fetching}
          component={FetchingScreen}
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name={AppRouterNames.App.Localization}
          component={LocalizationScreen}
          options={{ headerShown: false, presentation: 'modal' }}
        />
      </Stack.Navigator>
    </>
  )
}
