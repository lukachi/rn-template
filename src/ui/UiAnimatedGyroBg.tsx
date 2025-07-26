import { Canvas, Fill, FractalNoise, RadialGradient, Rect, vec } from '@shopify/react-native-skia'
import { BlurView } from 'expo-blur'
import Matter from 'matter-js'
import { useCallback, useEffect, useRef } from 'react'
import type { ViewProps } from 'react-native'
import { Dimensions, View } from 'react-native'
import {
  interpolateColor,
  runOnJS,
  SensorType,
  useAnimatedReaction,
  useAnimatedSensor,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { useAppTheme } from '@/theme'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

export default function UiAnimatedGyroBg(props: ViewProps) {
  const { palette } = useAppTheme()

  // Refs for performance - avoid recreation on each render
  const engineRef = useRef<Matter.Engine | null>(null)
  const ballRef = useRef<Matter.Body | null>(null)
  const animationRef = useRef<number | null>(null)

  const gyroscope = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 16 }) // ~60fps
  const ballX = useSharedValue(screenWidth / 2)
  const ballY = useSharedValue(screenHeight / 2)
  const velocityMagnitude = useSharedValue(0)

  // Add color interpolation shared value
  const colorProgress = useSharedValue(0)

  // Initialize Matter.js world once
  const initializePhysics = useCallback(() => {
    if (engineRef.current) return

    // Create engine with optimized settings
    const engine = Matter.Engine.create({
      enableSleeping: false, // Disable sleeping for continuous animation
      positionIterations: 6,
      velocityIterations: 4,
      constraintIterations: 2,
    })

    // Configure world - use normal gravity scale
    engine.gravity.scale = 0.001
    engine.timing.timeScale = 1

    // Create ball with optimized properties
    const ball = Matter.Bodies.circle(screenWidth / 2, screenHeight / 2, 30, {
      restitution: 0.6, // Reduced bounciness for smoother movement
      friction: 0.01, // Very low friction
      frictionAir: 0.001, // Very low air resistance
      density: 0.001, // Light ball
      render: { visible: false },
    })

    // Create boundaries with proper physics
    const wallThickness = 50
    const boundaries = [
      // Top wall
      Matter.Bodies.rectangle(screenWidth / 2, -wallThickness / 2, screenWidth, wallThickness, {
        isStatic: true,
        render: { visible: false },
      }),
      // Bottom wall
      Matter.Bodies.rectangle(
        screenWidth / 2,
        screenHeight + wallThickness / 2,
        screenWidth,
        wallThickness,
        {
          isStatic: true,
          render: { visible: false },
        },
      ),
      // Left wall
      Matter.Bodies.rectangle(-wallThickness / 2, screenHeight / 2, wallThickness, screenHeight, {
        isStatic: true,
        render: { visible: false },
      }),
      // Right wall
      Matter.Bodies.rectangle(
        screenWidth + wallThickness / 2,
        screenHeight / 2,
        wallThickness,
        screenHeight,
        {
          isStatic: true,
          render: { visible: false },
        },
      ),
    ]

    // Add bodies to world
    Matter.World.add(engine.world, [ball, ...boundaries])

    // Store references
    engineRef.current = engine
    ballRef.current = ball

    return { engine, ball }
  }, [])

  // Physics update function (runs on JS thread)
  const updatePhysics = useCallback(
    (gyroXValue: number, gyroYValue: number) => {
      const engine = engineRef.current
      const ball = ballRef.current

      if (!engine || !ball) return

      // Apply gravity based on gyroscope
      engine.gravity.x = -gyroYValue * 0.5
      engine.gravity.y = gyroXValue * 0.5

      // Step physics simulation
      Matter.Engine.update(engine, 16.67) // Fixed 60fps timestep

      // Update shared values
      ballX.value = ball.position.x
      ballY.value = ball.position.y

      // Calculate velocity magnitude
      const velX = ball.velocity.x
      const velY = ball.velocity.y
      velocityMagnitude.value = Math.sqrt(velX * velX + velY * velY)
    },
    [ballX, ballY, velocityMagnitude],
  )

  // Animation loop using requestAnimationFrame
  // const animate = useCallback(() => {
  //   updatePhysics(gyroX.value, gyroY.value)

  //   animationRef.current = requestAnimationFrame(animate)
  // }, [updatePhysics, gyroX.value, gyroY.value])

  // Use useAnimatedReaction to watch gyroscope changes
  useAnimatedReaction(
    () => ({
      x: gyroscope.sensor.value.x,
      y: gyroscope.sensor.value.y,
    }),
    current => {
      runOnJS(updatePhysics)(current.x, current.y)
    },
  )

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current)
      engineRef.current = null
    }
    ballRef.current = null
  }, [])

  // Initialize physics on mount
  useEffect(() => {
    initializePhysics()
    // animate() // Start animation loop

    // Start color interpolation animation
    colorProgress.value = withRepeat(
      withTiming(1, { duration: 4000 }), // 4 seconds for smooth transition
      -1, // infinite repeat
      true, // reverse (back and forth)
    )

    return cleanup
  }, [initializePhysics, cleanup, colorProgress])

  // Derived values for gradient
  const derivedRadialGradientC = useDerivedValue(() => {
    return vec(ballX.value, ballY.value)
  })

  const derivedRadialGradientR = useDerivedValue(() => {
    const baseRadius = screenHeight / 2
    const maxSpeedEffect = 40
    const speedEffect = Math.min(velocityMagnitude.value * 3, maxSpeedEffect)

    return baseRadius + speedEffect
  })

  // Add derived value for interpolated color
  const derivedGradientColors = useDerivedValue(() => {
    return [
      interpolateColor(colorProgress.value, [0, 1], [palette.primaryMain, palette.secondaryMain]),
      palette.backgroundPrimary,
    ]
  })

  return (
    <View {...props} style={[{ flex: 1 }, props.style]}>
      {/* Background gradient layer */}
      <View className='absolute inset-0'>
        <Canvas style={{ flex: 1 }}>
          <Rect x={0} y={0} width={screenWidth} height={screenHeight}>
            <RadialGradient
              c={derivedRadialGradientC}
              r={derivedRadialGradientR}
              colors={derivedGradientColors}
            />
          </Rect>
        </Canvas>
      </View>

      <View className='absolute inset-0 size-full overflow-hidden'>
        <BlurView experimentalBlurMethod='dimezisBlurView' intensity={85} className='size-full' />
      </View>

      <View className='absolute inset-0 opacity-10'>
        <Canvas style={{ flex: 1 }}>
          <Fill color={palette.backgroundPrimary} />
          <Rect x={0} y={0} width={screenWidth} height={screenHeight}>
            <FractalNoise freqX={0.4} freqY={0.4} octaves={7} />
          </Rect>
        </Canvas>
      </View>
    </View>
  )
}
