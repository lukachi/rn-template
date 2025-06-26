import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import InviteOthers from '@/pages/app/pages/invite-others'
import type {
  AppStackParamsList,
  AppStackScreenProps,
  AppTabParamsList,
  RootStackScreenProps,
} from '@/route-types'
import { UiIcon } from '@/ui'

import BottomTabBar from './components/BottomTabBarTabBar'
import DocumentScanScreen from './pages/document-scan'
import DocumentsScreen from './pages/documents'
import HomeScreen from './pages/home'
import PassportTests from './pages/passport-tests'
import ProfileScreen from './pages/profile'

const Stack = createNativeStackNavigator<AppStackParamsList>()
const Tab = createBottomTabNavigator<AppTabParamsList>()

// eslint-disable-next-line no-empty-pattern
function AppTabs({}: AppStackScreenProps<'Tabs'>) {
  return (
    <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
        },
      }}
      initialRouteName='Home'
    >
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
        name='Documents'
        component={DocumentsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <UiIcon libIcon='Fontisto' name='passport-alt' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name='Scan'
        component={DocumentScanScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <UiIcon libIcon='MaterialCommunityIcons' name='line-scan' size={size} color={color} />
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
      <Tab.Screen
        name='PassportTests'
        component={PassportTests}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <UiIcon libIcon='MaterialCommunityIcons' name='test-tube' size={size} color={color} />
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
      <Stack.Screen
        name='InviteOthers'
        component={InviteOthers}
        options={{
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  )
}
