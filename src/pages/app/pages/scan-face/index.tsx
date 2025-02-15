import { useAppState } from '@react-native-community/hooks'
import { useIsFocused } from '@react-navigation/native'
import { PaintStyle, Skia } from '@shopify/react-native-skia'
import type { SkPaint } from '@shopify/react-native-skia/src/skia/types/Paint'
import { useEffect, useMemo, useRef } from 'react'
import { ScrollView, Text, View } from 'react-native'
import Reanimated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue as useReanimatedSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Camera,
  CameraProps,
  useCameraDevice,
  useCameraPermission,
  useSkiaFrameProcessor,
} from 'react-native-vision-camera'
import { useFaceDetector } from 'react-native-vision-camera-face-detector'
import { useSharedValue as useWorkletSharedValue } from 'react-native-worklets-core'

import { AppTabScreenProps } from '@/route-types'
import { UiButton } from '@/ui'

Reanimated.addWhitelistedNativeProps({
  zoom: true,
})
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)

// eslint-disable-next-line no-empty-pattern
export default function ScanFace({}: AppTabScreenProps<'ScanFace'>) {
  const insets = useSafeAreaInsets()

  const isFocused = useIsFocused()
  const currentAppState = useAppState()

  const device = useCameraDevice('front')
  const { hasPermission, requestPermission } = useCameraPermission()

  //
  // vision camera ref
  //
  // const faces = useSharedValue<Face[]>([])
  // const [resizedImageBase64, setResizedImageBase64] = useState<string>()

  const zoom = useReanimatedSharedValue(device?.neutralZoom ?? 1)

  const zoomAnimatedProps = useAnimatedProps<CameraProps>(
    () => ({
      zoom: interpolate(
        1,
        [1, 10],
        [device?.minZoom ?? 0.5, device?.maxZoom ?? 2],
        Extrapolation.CLAMP,
      ),
    }),
    [zoom],
  )

  const scanProgress = useReanimatedSharedValue(0)
  useEffect(() => {
    scanProgress.value = withDelay(
      500,
      withRepeat(
        withTiming(1, {
          duration: 2000,
        }),
        Infinity, // Infinite repeat
        // true, // Reverse direction
      ),
    )
  }, [])

  const scanProgressWorkletSharedValue = useWorkletSharedValue(0)
  useAnimatedReaction(
    () => scanProgress.value,
    value => {
      scanProgressWorkletSharedValue.value = value
    },
  )

  const camera = useRef<Camera>(null)
  //
  // face rectangle position
  //
  // const aFaceW = useSharedValue(0)
  // const aFaceH = useSharedValue(0)
  // const aFaceX = useSharedValue(0)
  // const aFaceY = useSharedValue(0)
  // const boundingBoxStyles = useAnimatedStyle(() => ({
  //   width: withTiming(aFaceW.value / 10, {
  //     duration: 100,
  //   }),
  //   height: withTiming(aFaceH.value / 10, {
  //     duration: 100,
  //   }),
  //   left: withTiming(aFaceX.value / 10, {
  //     duration: 100,
  //   }),
  //   top: withTiming(aFaceY.value / 10, {
  //     duration: 100,
  //   }),
  // }))

  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast',
    classificationMode: 'all',
    landmarkMode: 'none',
    contourMode: 'none',
  })

  // const { resize } = useResizePlugin()

  // const handleDetectedFaces = Worklets.createRunOnJS((faces: Face[], frame: Frame) => {
  //   // if no faces are detected we do nothing
  //   if (Object.keys(faces).length <= 0) {
  //     console.log('resetting')
  //     aFaceW.value = 0
  //     aFaceH.value = 0
  //     aFaceX.value = 0
  //     aFaceY.value = 0
  //
  //     return
  //   }
  //
  //   const { bounds } = faces[0]
  //   const { width, height, x, y } = bounds
  //
  //   aFaceW.value = width
  //   aFaceH.value = height
  //   aFaceX.value = x
  //   aFaceY.value = y
  //
  //   // resizedFace.value = resize(frame, {
  //   //   scale: {
  //   //     width: 192,
  //   //     height: 192,
  //   //   },
  //   //   crop: {
  //   //     x,
  //   //     y,
  //   //     width: Math.max(width, height),
  //   //     height: Math.max(width, height),
  //   //   },
  //   //   pixelFormat: 'rgb',
  //   //   dataType: 'uint8',
  //   // })
  //   // console.log(resizedFace.value)
  //
  //   // only call camera methods if ref is defined
  //   if (camera.current) {
  //     // take photo, capture video, etc...
  //   }
  // })

  // const convertResizedFace = Worklets.createRunOnJS((resizedFaceBytes: Uint8Array) => {
  //   if (resizedImageBase64) return
  //
  //   const converted = encodeBase64(new Uint8Array(resizedFaceBytes))
  //   setResizedImageBase64(converted)
  // })

  const faceContainerPaints = useWorkletSharedValue<Record<number, SkPaint>>({})

  // const faceContainerPaint = Skia.Paint()
  // faceContainerPaint.setStyle(PaintStyle.Stroke)
  // faceContainerPaint.setStrokeWidth(4)
  // faceContainerPaint.setColor(Skia.Color('red'))

  /**
   * Camera frame processor
   */
  const frameProcessor = useSkiaFrameProcessor(frame => {
    'worklet'
    frame.render()

    const _faces = detectFaces(frame)
    // faces.value = _faces

    _faces.forEach((face, idx) => {
      const faceContainerPath = Skia.Path.Make()

      if (face.bounds) {
        const rect = Skia.XYWHRect(
          face.bounds.x,
          face.bounds.y,
          face.bounds.height,
          face.bounds.width,
        )
        faceContainerPath.addOval(rect)
        faceContainerPath.trim(0, scanProgressWorkletSharedValue.value, false)

        frame.save()

        if (!faceContainerPaints.value[idx]) {
          faceContainerPaints.value[idx] = Skia.Paint()
          faceContainerPaints.value[idx].setStyle(PaintStyle.Stroke)
          faceContainerPaints.value[idx].setStrokeWidth(4)
          faceContainerPaints.value[idx].setColor(Skia.Color('red'))
        }

        faceContainerPaints.value[idx].setColor(
          Skia.Color(face.yawAngle >= 8 || face.yawAngle <= -8 ? 'green' : 'red'),
        )

        frame.drawPath(faceContainerPath, faceContainerPaints.value[idx])

        frame.restore()
        // frame.drawPath(faceContainer, faceContainerPaint)
      }
    })

    // if (_faces.length) {
    //   // const face = _faces[0]
    //
    //   // const leftEyePath = Skia.Path.Make()
    //   // if (face.contours?.LEFT_EYE) {
    //   //   for (const contour of face.contours.LEFT_EYE) {
    //   //     leftEyePath.lineTo(contour.x, contour.y)
    //   //   }
    //   //   leftEyePath.lineTo(face.contours.LEFT_EYE[0].x, face.contours.LEFT_EYE[0].y)
    //   //   leftEyePath.close()
    //   // }
    //   //
    //   // const rightEyePath = Skia.Path.Make()
    //   // if (face.contours?.RIGHT_EYE) {
    //   //   for (const contour of face.contours.RIGHT_EYE) {
    //   //     rightEyePath.lineTo(contour.x, contour.y)
    //   //   }
    //   //   rightEyePath.lineTo(face.contours.RIGHT_EYE[0].x, face.contours.RIGHT_EYE[0].y)
    //   //   rightEyePath.close()
    //   // }
    //   //
    //   // const mouthPath = Skia.Path.Make()
    //   // if (
    //   //   face.contours?.LOWER_LIP_TOP &&
    //   //   face.contours?.LOWER_LIP_BOTTOM &&
    //   //   face.contours?.UPPER_LIP_BOTTOM &&
    //   //   face.contours?.UPPER_LIP_TOP
    //   // ) {
    //   //   for (const contour of face.contours.LOWER_LIP_TOP) {
    //   //     mouthPath.lineTo(contour.x, contour.y)
    //   //   }
    //   //   for (const contour of face.contours.LOWER_LIP_BOTTOM) {
    //   //     mouthPath.lineTo(contour.x, contour.y)
    //   //   }
    //   //   for (const contour of face.contours.UPPER_LIP_BOTTOM) {
    //   //     mouthPath.lineTo(contour.x, contour.y)
    //   //   }
    //   //   for (const contour of face.contours.UPPER_LIP_TOP) {
    //   //     mouthPath.lineTo(contour.x, contour.y)
    //   //   }
    //   //   mouthPath.lineTo(face.contours.LOWER_LIP_TOP[0].x, face.contours.LOWER_LIP_TOP[0].y)
    //   //   mouthPath.close()
    //   // }
    //
    //   // const faceContainer = Skia.Path.Make()
    //   // if (face.bounds) {
    //   //   faceContainer.addRect(Skia.XYWHRect(face.bounds.x, face.bounds.y, 2, face.bounds.width))
    //   //
    //   //   // add a horizontal line inside faceContainer which will go up and down based on scanProgress.value
    //   //   // faceContainer.moveTo(
    //   //   //   face.bounds.x,
    //   //   //   face.bounds.y + (face.bounds.height / 100) * scanProgress.value,
    //   //   // )
    //   //   console.log(scanProgress.value)
    //   // }
    //
    //   // const paint = Skia.Paint()
    //   // paint.setColor(Skia.Color('red'))
    //   // frame.drawPath(leftEyePath, paint)
    //   // frame.drawPath(rightEyePath, paint)
    //   // frame.drawPath(mouthPath, paint)
    //
    //   // const faceContainerPaint = Skia.Paint()
    //   // faceContainerPaint.setColor(Skia.Color('red'))
    //   // frame.drawPath(faceContainer, faceContainerPaint)
    // }

    // FIXME: https://github.com/mrousavy/react-native-vision-camera/issues/2820
    // runAtTargetFps(2, () => {
    //   'worklet'
    //
    //   if (_faces.length) {
    //     const resized = resize(frame, {
    //       scale: {
    //         width: 192,
    //         height: 192,
    //       },
    //       crop: {
    //         x: _faces[0].bounds.x,
    //         y: _faces[0].bounds.y,
    //         width: Math.max(_faces[0].bounds.width, _faces[0].bounds.height),
    //         height: Math.max(_faces[0].bounds.width, _faces[0].bounds.height),
    //       },
    //       pixelFormat: 'rgb',
    //       dataType: 'uint8',
    //     })
    //
    //     try {
    //       convertResizedFace(resized)
    //     } catch (error) {
    //       console.error(error)
    //     }
    //     // handleDetectedFaces(_faces, frame)
    //   }
    // })
  }, [])

  const isActive = useMemo(() => {
    return isFocused && currentAppState === 'active'
  }, [currentAppState, isFocused])

  useEffect(() => {
    if (hasPermission) return

    requestPermission()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {hasPermission ? (
          <>
            {device && (
              <View
                className='relative mx-auto aspect-square overflow-hidden rounded-full border-[8px] border-solid border-primaryMain'
                style={{
                  marginTop: insets.top,
                }}
              >
                <ReanimatedCamera
                  ref={camera}
                  enableFpsGraph={true}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  device={device}
                  isActive={isActive}
                  frameProcessor={frameProcessor}
                  animatedProps={zoomAnimatedProps}
                />
              </View>
            )}
          </>
        ) : (
          <>
            <View>
              <Text className='text-textPrimary typography-h4'>Requesting Camera Permission</Text>

              <UiButton onPress={requestPermission} title='Request Permission' />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}
