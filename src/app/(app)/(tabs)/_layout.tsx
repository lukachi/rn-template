import { Fontisto } from '@expo/vector-icons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Octicons from '@expo/vector-icons/Octicons'
import { Link, Tabs } from 'expo-router'
import { Button, Pressable, Text } from 'react-native'

import { translate } from '@/core'
import { authStore, localAuthStore } from '@/store'
import { cn, useAppTheme } from '@/theme'

export default function TabLayout() {
  const { palette } = useAppTheme()
  const logout = authStore.useAuthStore(state => state.logout)
  // optional
  const resetLocalAuthStore = localAuthStore.useLocalAuthStore(state => state.resetStore)

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
              onPress={async () => {
                logout()
                await resetLocalAuthStore()
              }}
            />
          ),
          headerRight: () => (
            <Link href='/custom' asChild>
              <Pressable>
                <Text className={cn('text-textPrimary')}>custom</Text>
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
      <Tabs.Screen
        name='ui-kit'
        options={{
          title: 'ui-kit',
          tabBarIcon: ({ color }) => <FontAwesome5 name='uikit' size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
