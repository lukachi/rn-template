import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import type { AppTabParamsList, RootStackScreenProps } from '@/route-types'
import { cn } from '@/theme'
import { UiIcon } from '@/ui'

import HomeScreen from './pages/home'
import ProfileScreen from './pages/profile'

const Tab = createBottomTabNavigator<AppTabParamsList>()

export default function App({}: RootStackScreenProps<'App'>) {
  return (
    <Tab.Navigator initialRouteName={'Home'}>
      <Tab.Screen
        name={'Home'}
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <UiIcon
              componentName='houseSimpleIcon'
              className={cn(focused ? 'text-primaryMain' : 'text-textSecondary')}
            />
          ),
        }}
      />
      <Tab.Screen
        name={'Profile'}
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <UiIcon
              componentName='userIcon'
              className={cn(focused ? 'text-primaryMain' : 'text-textSecondary')}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
