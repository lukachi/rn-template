import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import type {
  AppStackParamsList,
  AppStackScreenProps,
  AppTabParamsList,
  RootStackScreenProps,
} from '@/route-types'
import { cn } from '@/theme'
import { UiIcon } from '@/ui'

import DocumentScanScreen from './pages/document-scan'
import HomeScreen from './pages/home'
import ProfileScreen from './pages/profile'

const Stack = createNativeStackNavigator<AppStackParamsList>()
const Tab = createBottomTabNavigator<AppTabParamsList>()

function AppTabs({}: AppStackScreenProps<'Tabs'>) {
  return (
    <Tab.Navigator initialRouteName={'Home'}>
      <Tab.Screen
        name={'Home'}
        component={HomeScreen}
        options={{
          headerShown: false,
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
          headerShown: false,
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

export default function App({ route }: RootStackScreenProps<'App'>) {
  console.log('pages App')
  console.log(route.params)
  console.log('======')

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
