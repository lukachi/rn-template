import { LiquidGlassView } from '@callstack/liquid-glass'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Pressable, View } from 'react-native'
import { useCSSVariable, useResolveClassNames } from 'uniwind'

import { cn } from '@/theme/utils'

export default function BottomTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const currentRoute = state.routes[state.index]

  const tabBarStyle = descriptors[currentRoute.key].options.tabBarStyle

  const overlayForegroundColor = useCSSVariable('--overlay-foreground')
  const mutedColor = useCSSVariable('--muted')

  const glassContainerStyle = useResolveClassNames(
    cn('relative isolate mx-auto flex w-[60%] rounded-full'),
  )
  const glassItemStyle = useResolveClassNames(
    cn('flex size-[50] items-center justify-center rounded-full'),
  )

  const bgOverlayStyle = useResolveClassNames('bg-overlay')

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
      <LiquidGlassView effect='clear' style={glassContainerStyle}>
        <View className='relative z-20 flex-row items-center justify-around py-2'>
          {state.routes.map((route, idx) => {
            const isFocused = idx === state.index

            const descriptor = descriptors[route.key]

            const routeIcon = descriptor.options.tabBarIcon?.({
              focused: isFocused,
              size: 24,
              color: isFocused ? String(overlayForegroundColor) : String(mutedColor),
            })

            return (
              <Pressable
                key={route.name}
                onPress={() => {
                  navigation.navigate(route.name)
                }}
              >
                <LiquidGlassView
                  interactive
                  style={[glassItemStyle, isFocused ? bgOverlayStyle : {}]}
                  effect={isFocused ? 'regular' : 'none'}
                >
                  {routeIcon}
                </LiquidGlassView>
              </Pressable>
            )
          })}
        </View>
      </LiquidGlassView>
    </View>
  )
}
