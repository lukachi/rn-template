import { Canvas, Fill, FractalNoise, RadialGradient, Rect, vec } from '@shopify/react-native-skia'
import Matter from 'matter-js'
import { useCallback, useEffect, useRef } from 'react'
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

  // Refs for performance - avoid recreation on each render
  const engineRef = useRef<Matter.Engine | null>(null)
  const ballRef = useRef<Matter.Body | null>(null)
  const animationRef = useRef<number | null>(null)

  const gyroscope = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 16 }) // ~60fps
  const ballX = useSharedValue(screenWidth / 2)
  const ballY = useSharedValue(screenHeight / 2)
  const velocityMagnitude = useSharedValue(0)

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
    (gyroX: number, gyroY: number) => {
      const engine = engineRef.current
      const ball = ballRef.current

      if (!engine || !ball) return

      // Apply gravity based on gyroscope
      engine.gravity.x = -gyroY * 0.5
      engine.gravity.y = gyroX * 0.5

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
  const animate = useCallback(() => {
    const gyroX = gyroscope.sensor.value.x
    const gyroY = gyroscope.sensor.value.y

    updatePhysics(gyroX, gyroY)

    animationRef.current = requestAnimationFrame(animate)
  }, [updatePhysics, gyroscope.sensor.value.x, gyroscope.sensor.value.y])

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
    animate() // Start animation loop
    return cleanup
  }, [initializePhysics, animate, cleanup])

  // Derived values for gradient
  const derivedRadialGradientC = useDerivedValue(() => {
    return vec(ballX.value, ballY.value)
  })

  const derivedRadialGradientR = useDerivedValue(() => {
    const baseRadius = screenHeight / 4
    const maxSpeedEffect = 40
    const speedEffect = Math.min(velocityMagnitude.value * 3, maxSpeedEffect)

    return baseRadius + speedEffect
  })

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {/* Background gradient layer */}
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

      {/* Noise overlay for texture */}
      <View className='absolute inset-0 opacity-10'>
        <Canvas style={{ flex: 1 }}>
          <Fill color={palette.backgroundPrimary} />
          <Rect x={0} y={0} width={screenWidth} height={screenHeight}>
            <FractalNoise freqX={0.5} freqY={0.5} octaves={4} />
          </Rect>
        </Canvas>
      </View>

      {/* Content layer */}
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
