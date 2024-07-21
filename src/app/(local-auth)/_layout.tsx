import { Stack } from 'expo-router'

export default function LocalAuthLayout() {
  return (
    <Stack initialRouteName='enable-passcode'>
      <Stack.Screen
        name='enable-passcode'
        options={{
          // headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name='set-passcode'
        options={{
          // headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name='enable-biometrics'
        options={{
          // headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name='lockscreen'
        options={{
          // headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  )
}
