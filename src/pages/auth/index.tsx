import { createNativeStackNavigator } from '@react-navigation/native-stack'

import type { AuthStackParamsList, RootStackScreenProps } from '@/route-types'

import { CreateWallet, Intro } from './components'

const Stack = createNativeStackNavigator<AuthStackParamsList>()

export default function Auth({}: RootStackScreenProps<'Auth'>) {
  return (
    <Stack.Navigator initialRouteName={'Intro'}>
      <Stack.Screen
        name={'Intro'}
        component={Intro}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'CreateWallet'}
        component={CreateWallet}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}
