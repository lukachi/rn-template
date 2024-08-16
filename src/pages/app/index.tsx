import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import type { AppTabParamsList, RootStackScreenProps } from '@/route-types'

import ProfileScreen from './pages/profile'

const Tab = createBottomTabNavigator<AppTabParamsList>()

export default function App({}: RootStackScreenProps<'App'>) {
  return (
    <Tab.Navigator initialRouteName={'Profile'}>
      <Tab.Screen name={'Profile'} component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  )
}
