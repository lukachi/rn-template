import { useEffect } from 'react'
import type { ViewProps } from 'react-native'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

type Props = {
  delay?: number
} & ViewProps

export default function UiSkeleton({ delay = 0, style, ...rest }: Props) {
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.2, {
          duration: 1_000,
          easing: Easing.linear,
        }),
        -1,
        true,
      ),
    )

    return () => {
      cancelAnimation(opacity)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pulseAnimation = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return <Animated.View {...rest} style={[pulseAnimation, style]} />
}
