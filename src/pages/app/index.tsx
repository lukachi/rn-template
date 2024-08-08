import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { AppRouterNames } from '@/route-names'

import FetchingScreen from './pages/fetching'
import LocalizationScreen from './pages/localization'
import UiKitScreen from './pages/ui-kit'

const Stack = createNativeStackNavigator()

export default function App() {
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
