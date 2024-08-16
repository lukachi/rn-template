import { createNativeStackNavigator } from '@react-navigation/native-stack'

import type { AppStackParamsList, RootStackScreenProps } from '@/route-types'

import FetchingScreen from './pages/fetching'
import LocalizationScreen from './pages/localization'
import ProfileScreen from './pages/profile'
import UiKitScreen from './pages/ui-kit'

const Stack = createNativeStackNavigator<AppStackParamsList>()

export default function App({}: RootStackScreenProps<'App'>) {
  return (
    <Stack.Navigator initialRouteName={'UiKit'}>
      <Stack.Screen name={'UiKit'} component={UiKitScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name={'Fetching'}
        component={FetchingScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name={'Localization'}
        component={LocalizationScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen name={'Profile'} component={ProfileScreen} options={{ title: 'Profile' }} />
    </Stack.Navigator>
  )
}
