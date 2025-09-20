import { createNativeStackNavigator } from '@react-navigation/native-stack'

import type { AuthStackParamsList, RootStackScreenProps } from '@/route-types'

import Intro from './pages/Intro'

const Stack = createNativeStackNavigator<AuthStackParamsList>()

// eslint-disable-next-line no-empty-pattern
export default function Auth({}: RootStackScreenProps<'Auth'>) {
  return (
    <Stack.Navigator initialRouteName='Intro'>
      <Stack.Screen
        name='Intro'
        component={Intro}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}
