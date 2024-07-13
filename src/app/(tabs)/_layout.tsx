import { Atom, AudioWaveform, TextCursor } from '@tamagui/lucide-icons'
import { Link, Tabs } from 'expo-router'
import { Button, useTheme } from 'tamagui'

import { translate } from '@/core'

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primaryMain?.val,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: translate('tabs.one'),
          tabBarIcon: ({ color }) => <Atom color={color} />,
          headerRight: () => (
            <Link href='/modal' asChild>
              <Button mr='$4' bg='$purple8' color='$purple12'>
                Hello!
              </Button>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name='two'
        options={{
          title: translate('tabs.two'),
          tabBarIcon: ({ color }) => <AudioWaveform color={color} />,
        }}
      />
      <Tabs.Screen
        name='typography'
        options={{
          title: translate('tabs.typography'),
          tabBarIcon: ({ color }) => <TextCursor color={color} />,
        }}
      />
    </Tabs>
  )
}
