import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import type {
  AppStackParamsList,
  AppStackScreenProps,
  AppTabParamsList,
  RootStackScreenProps,
} from '@/route-types'
import { useAppPaddings } from '@/theme'
import { UiIcon } from '@/ui'

import BottomTabBar from './components/BottomTabBarTabBar'
import DocumentScanScreen from './pages/document-scan'
import HomeScreen from './pages/home'
import ProfileScreen from './pages/profile'

const Stack = createNativeStackNavigator<AppStackParamsList>()
const Tab = createBottomTabNavigator<AppTabParamsList>()

function AppTabs({}: AppStackScreenProps<'Tabs'>) {
  const { left, right } = useAppPaddings()

  return (
    <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          paddingLeft: left,
          paddingRight: right,
        },
      }}
      initialRouteName={'Home'}
    >
      <Tab.Screen
        name={'Home'}
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <UiIcon customIcon='houseSimpleIcon' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={'Profile'}
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

export default function App({}: RootStackScreenProps<'App'>) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={'Tabs'}
        component={AppTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'Scan'}
        component={DocumentScanScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}
