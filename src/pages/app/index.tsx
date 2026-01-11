import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HouseIcon, User2Icon } from 'lucide-react-native'

import { RootStackScreenProps } from '@/route-types'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'

import BottomTabBar from './components/BottomTabBarTabBar'
import HomeScreen from './pages/home'
import ProfileScreen from './pages/profile'
import { AppStackParamsList, AppStackScreenProps, AppTabParamsList } from './route-types'

const Stack = createNativeStackNavigator<AppStackParamsList>()
const Tab = createBottomTabNavigator<AppTabParamsList>()
// const Tab = createNativeBottomTabNavigator<AppTabParamsList>()

// eslint-disable-next-line no-empty-pattern
function AppTabs({}: AppStackScreenProps<'Tabs'>) {
  return (
    <>
      <Tab.Navigator tabBar={props => <BottomTabBar {...props} />} initialRouteName='Home'>
        <Tab.Screen
          name='Home'
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <UiLucideIcon as={HouseIcon} size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name='Profile'
          component={ProfileScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <UiLucideIcon as={User2Icon} size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  )
}

// eslint-disable-next-line no-empty-pattern
export default function App({}: RootStackScreenProps<'App'>) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name='Tabs' component={AppTabs} />
    </Stack.Navigator>
  )
}
