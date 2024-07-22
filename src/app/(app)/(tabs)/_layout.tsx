import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Octicons from '@expo/vector-icons/Octicons'
import { router, Tabs } from 'expo-router'

import { translate } from '@/core'
import { authStore, localAuthStore } from '@/store'
import { useAppTheme } from '@/theme'
import { UiButton } from '@/ui'

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
          title: 'ui-kit',
          tabBarIcon: ({ color }) => <FontAwesome5 name='uikit' size={24} color={color} />,
          headerLeft: () => (
            <UiButton
              title='log out'
              variant='text'
              color='error'
              onPress={async () => {
                logout()
                await resetLocalAuthStore()
              }}
            />
          ),
          headerRight: () => (
            <UiButton
              title='simple fetch'
              variant='text'
              onPress={async () => {
                router.push('/custom')
              }}
            />
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
