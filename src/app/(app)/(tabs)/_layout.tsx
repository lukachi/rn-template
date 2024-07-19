import { Fontisto } from '@expo/vector-icons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Octicons from '@expo/vector-icons/Octicons'
import { Link, Tabs } from 'expo-router'
import { Button, Pressable, Text } from 'react-native'

import { translate } from '@/core'
import { authStore } from '@/store'
import { useAppTheme } from '@/theme'

export default function TabLayout() {
  const { palette } = useAppTheme()
  const logout = authStore.useAuthStore(state => state.logout)

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.textPrimary,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: translate('tabs.one'),
          tabBarIcon: ({ color }) => <Fontisto name='atom' size={24} color={color} />,
          headerLeft: () => (
            <Button
              title='log out'
              onPress={() => {
                logout()
              }}
            />
          ),
          headerRight: () => (
            <Link href='/custom' asChild>
              <Pressable>
                <Text>custom</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name='colors'
        options={{
          title: 'colors',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name='multitrack-audio' size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='typography'
        options={{
          title: translate('tabs.typography'),
          tabBarIcon: ({ color }) => <Octicons name='typography' size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
