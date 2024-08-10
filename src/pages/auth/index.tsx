import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { AppRouterNames } from '@/route-names'

import { CreateWallet, Intro } from './components'

const Stack = createNativeStackNavigator()

export default function Auth() {
  return (
    <Stack.Navigator initialRouteName={AppRouterNames.Auth.Intro}>
      <Stack.Screen
        name={AppRouterNames.Auth.Intro}
        component={Intro}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={AppRouterNames.Auth.CreateWallet}
        component={CreateWallet}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}
