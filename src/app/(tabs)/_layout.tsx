import { useTheme } from '@react-navigation/native'
import { Tabs } from 'expo-router'

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
        name='colors'
        options={{
          title: 'colors',
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
