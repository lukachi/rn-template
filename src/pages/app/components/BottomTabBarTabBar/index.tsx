import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { TouchableOpacity, View } from 'react-native'

import { cn, useAppTheme } from '@/theme'

export default function BottomTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const { palette } = useAppTheme()

  const currentRoute = state.routes[state.index]

  const tabBarStyle = descriptors[currentRoute.key].options.tabBarStyle

  return (
    <View
      style={{
        ...(tabBarStyle as object),
      }}
      className={cn('flex w-full items-center justify-center')}
    >
      <View
        className='flex w-full flex-row items-center justify-around bg-backgroundPrimary'
        style={{
          paddingTop: 12,
          paddingBottom: insets.bottom,
        }}
      >
        {state.routes.map((route, idx) => {
          const isFocused = idx === state.index

          const descriptor = descriptors[route.key]

          const routeIcon = descriptor.options.tabBarIcon?.({
            focused: isFocused,
            size: 24,
            color: isFocused ? palette.textPrimary : palette.textSecondary,
          })

          return (
            <TouchableOpacity
              key={route.name}
              onPress={() => {
                navigation.navigate(route.name)
              }}
            >
              <View
                className={cn(
                  'flex size-[50] items-center justify-center rounded-full',
                  isFocused && 'bg-backgroundContainer',
                )}
              >
                {routeIcon}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
