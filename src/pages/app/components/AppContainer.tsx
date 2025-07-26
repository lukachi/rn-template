import { Canvas, Fill, FractalNoise, RadialGradient, Rect, vec } from '@shopify/react-native-skia'
import type { ViewProps } from 'react-native'
import { Dimensions, View } from 'react-native'
import {
  SensorType,
  useAnimatedSensor,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'

import { cn, useAppTheme, useBottomBarOffset } from '@/theme'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

type Props = {
  isBottomBlockShown?: boolean
} & ViewProps

export default function AppContainer({ isBottomBlockShown = false, children, ...rest }: Props) {
  const offset = useBottomBarOffset()
  const { palette } = useAppTheme()

  const gyroscope = useAnimatedSensor(SensorType.GYROSCOPE)

  // Position tracking for the "ball"
  const ballX = useSharedValue(screenWidth / 2)
  const ballY = useSharedValue(screenHeight / 2)

  // Physics constants - adjusted for slower, smoother movement
  const gravity = 150 // Reduced from 500 - less responsive to tilting
  const friction = 0.995 // Increased from 0.98 - less energy loss, smoother movement
  const bounceThreshold = 80 // Increased from 50 - softer boundaries
  const timeStep = 0.008 // Reduced from 0.016 - smaller movement increments

  // Velocity tracking
  const velocityX = useSharedValue(0)
  const velocityY = useSharedValue(0)

  const derivedRadialGradientC = useDerivedValue(() => {
    // Get gyroscope data (rotation rates in rad/s)
    const rotationX = gyroscope.sensor.value.x // Pitch (forward/backward tilt)
    const rotationY = gyroscope.sensor.value.y // Roll (left/right tilt)

    // Convert rotation to acceleration (invert for natural feel)
    const accelX = -rotationY * gravity
    const accelY = rotationX * gravity

    // Update velocity with acceleration and friction
    velocityX.value = (velocityX.value + accelX * timeStep) * friction
    velocityY.value = (velocityY.value + accelY * timeStep) * friction

    // Update position with velocity
    ballX.value += velocityX.value * timeStep
    ballY.value += velocityY.value * timeStep

    // Boundary checking with softer bounce
    if (ballX.value < bounceThreshold) {
      ballX.value = bounceThreshold
      velocityX.value = Math.abs(velocityX.value) * 0.5 // Reduced from 0.7 - softer bounce
    } else if (ballX.value > screenWidth - bounceThreshold) {
      ballX.value = screenWidth - bounceThreshold
      velocityX.value = -Math.abs(velocityX.value) * 0.5
    }

    if (ballY.value < bounceThreshold) {
      ballY.value = bounceThreshold
      velocityY.value = Math.abs(velocityY.value) * 0.5
    } else if (ballY.value > screenHeight - bounceThreshold) {
      ballY.value = screenHeight - bounceThreshold
      velocityY.value = -Math.abs(velocityY.value) * 0.5
    }

    return vec(ballX.value, ballY.value)
  })

  const derivedRadialGradientR = useDerivedValue(() => {
    // Make radius changes more subtle and smooth
    const speed = Math.sqrt(velocityX.value * velocityX.value + velocityY.value * velocityY.value)
    const baseRadius = screenHeight / 3.5 // Slightly larger base radius
    const speedEffect = Math.min(speed * 0.05, 15) // Reduced effect intensity

    return baseRadius + speedEffect
  })

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View className='absolute inset-0'>
        <Canvas style={{ flex: 1 }}>
          <Rect x={0} y={0} width={screenWidth} height={screenHeight}>
            <RadialGradient
              c={derivedRadialGradientC}
              r={derivedRadialGradientR}
              colors={[palette.primaryMain, palette.backgroundPrimary]}
            />
          </Rect>
        </Canvas>
      </View>
      <View className='absolute inset-0 opacity-10'>
        <Canvas
          style={{
            flex: 1,
          }}
        >
          <Fill color={palette.backgroundPrimary} />
          <Rect x={0} y={0} width={screenWidth} height={screenHeight}>
            <FractalNoise freqX={0.5} freqY={0.5} octaves={4} />
          </Rect>
        </Canvas>
      </View>

      <View
        {...rest}
        style={[
          rest.style,
          {
            flex: 1,
          },
        ]}
      >
        <View className={cn('flex-1')}>{children}</View>
        {isBottomBlockShown && (
          <View
            style={{
              height: offset,
              width: '100%',
            }}
          />
        )}
      </View>
    </View>
  )
}
