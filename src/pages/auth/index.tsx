import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View } from 'react-native'

import type { RootStackScreenProps } from '@/route-types'

import Intro from './pages/Intro'
import SignUp from './pages/SignUp'
import { AuthStackParamsList } from './route-types'

const Stack = createNativeStackNavigator<AuthStackParamsList>()

// eslint-disable-next-line no-empty-pattern
export default function Auth({}: RootStackScreenProps<'Auth'>) {
  return (
    <View className='relative flex-1'>
      <Stack.Navigator initialRouteName='Intro'>
        <Stack.Screen
          name='Intro'
          component={Intro}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name='SignUp'
          component={SignUp}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </View>
  )
}
