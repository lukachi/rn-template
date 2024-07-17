import { Fontisto } from '@expo/vector-icons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Octicons from '@expo/vector-icons/Octicons'
import { Tabs } from 'expo-router'

import { translate } from '@/core'
import { usePalette } from '@/theme'

export default function TabLayout() {
  const palette = usePalette()

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
