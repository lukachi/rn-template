import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { BlurView } from 'expo-blur'
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
        paddingTop: 20,
        paddingBottom: insets.bottom,
        backgroundColor: 'transparent',
      }}
      className={cn('absolute bottom-0 left-0 w-full')}
    >
      <View className='relative isolate mx-auto flex w-[60%] rounded-full bg-componentPrimary'>
        <View className='absolute left-0 top-0 z-10 size-full overflow-hidden rounded-full'>
          <BlurView experimentalBlurMethod='dimezisBlurView' intensity={35} className='size-full' />
        </View>
        <View className='z-20 flex-row items-center justify-around py-2'>
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
    </View>
  )
}
