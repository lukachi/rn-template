import { useTheme } from '@react-navigation/native'
import { Link, Tabs } from 'expo-router'
import { Button } from 'react-native'

import { translate } from '@/core'

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: translate('tabs.one'),
          // tabBarIcon: ({ color }) => <Atom color={color} />,
          // headerRight: () => (
          //   <Link
          //     href='/'
          //     style={{
          //       marginRight: 24,
          //       backgroundColor: theme.colors.card,
          //       color: theme.colors.text,
          //     }}
          //     asChild
          //   >
          //     <Button title={'Hello!'} />
          //   </Link>
          // ),
        }}
      />
      <Tabs.Screen
        name='two'
        options={{
          title: translate('tabs.two'),
          // tabBarIcon: ({ color }) => <AudioWaveform color={color} />,
        }}
      />
      <Tabs.Screen
        name='typography'
        options={{
          title: translate('tabs.typography'),
          // tabBarIcon: ({ color }) => <TextCursor color={color} />,
        }}
      />
    </Tabs>
  )
}
