import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import type {
  AppStackParamsList,
  AppStackScreenProps,
  AppTabParamsList,
  RootStackScreenProps,
} from '@/route-types'
import UiIcon from '@/ui/UiIcon'

import BottomTabBar from './components/BottomTabBarTabBar'
import HomeScreen from './pages/home'
import ProfileScreen from './pages/profile'

const Stack = createNativeStackNavigator<AppStackParamsList>()
const Tab = createBottomTabNavigator<AppTabParamsList>()

// eslint-disable-next-line no-empty-pattern
function AppTabs({}: AppStackScreenProps<'Tabs'>) {
  return (
    <Tab.Navigator tabBar={props => <BottomTabBar {...props} />} initialRouteName='Home'>
      <Tab.Screen
        name='Home'
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <UiIcon libIcon='FontAwesome' name='home' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <UiIcon customIcon='userIcon' size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
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
