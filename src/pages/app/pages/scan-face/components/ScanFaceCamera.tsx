import { useAppState } from '@react-native-community/hooks'
import { useIsFocused } from '@react-navigation/native'
import { PaintStyle, Skia } from '@shopify/react-native-skia'
import type { SkPaint } from '@shopify/react-native-skia/src/skia/types/Paint'
import { Buffer } from 'buffer'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { ColorConversionCodes, DataTypes, ObjectType, OpenCV } from 'react-native-fast-opencv'
import Reanimated, {
  useAnimatedReaction,
  useSharedValue as useReanimatedSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Camera,
  runAtTargetFps,
  useCameraDevice,
  useCameraPermission,
  useSkiaFrameProcessor,
} from 'react-native-vision-camera'
import { useFaceDetector } from 'react-native-vision-camera-face-detector'
import { useSharedValue as useWorkletSharedValue, Worklets } from 'react-native-worklets-core'
import { useResizePlugin } from 'vision-camera-resize-plugin'

import { UiButton, UiImage } from '@/ui'

Reanimated.addWhitelistedNativeProps({
  zoom: true,
})
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)

const CROP_SIZE = 48

type Props = {
  onFaceResized: (image: Uint8Array<ArrayBufferLike>) => void
}

export default function ScanFaceCamera({ onFaceResized }: Props) {
  const insets = useSafeAreaInsets()

  const isFocused = useIsFocused()
  const currentAppState = useAppState()

  const device = useCameraDevice('front')
  const { hasPermission, requestPermission } = useCameraPermission()

  // const zoom = useReanimatedSharedValue(device?.neutralZoom ?? 1)
  //
  // const zoomAnimatedProps = useAnimatedProps<CameraProps>(
  //   () => ({
  //     zoom: interpolate(
  //       1,
  //       [1, 10],
  //       [device?.minZoom ?? 0.5, device?.maxZoom ?? 2],
  //       Extrapolation.CLAMP,
  //     ),
  //   }),
  //   [zoom],
  // )

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

  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast',
    classificationMode: 'all',
    landmarkMode: 'none',
    contourMode: 'none',
  })

  const { resize } = useResizePlugin()

  const faceContainerPaints = useWorkletSharedValue<Record<number, SkPaint>>({})

  const [previewImage, setPreviewImage] = useState('')

  const updatePreviewImage = useMemo(
    () =>
      Worklets.createRunOnJS((dataBase64: string) => {
        setPreviewImage(`data:image/png;base64,${dataBase64}`)
      }),
    [],
  )

  const handleFaceResized = useMemo(
    () =>
      Worklets.createRunOnJS((resizedBase64: string) => {
        try {
          const croppedBytes = Buffer.from(`data:image/png;base64,${resizedBase64}`, 'base64')

          console.log(croppedBytes.length)

          onFaceResized(new Uint8Array(croppedBytes.buffer))
        } catch (error) {
          console.error(error)
        }
      }),
    [onFaceResized],
  )

  const frameProcessor = useSkiaFrameProcessor(
    frame => {
      'worklet'
      frame.render()

      const _faces = detectFaces(frame)

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

          const isPitchAngleValid = face.pitchAngle > -5 && face.pitchAngle < 5
          const isRollAngleValid = face.rollAngle > -5 && face.rollAngle < 5
          const isYawAngleValid = face.yawAngle > -5 && face.yawAngle < 5

          if (isPitchAngleValid && isRollAngleValid && isYawAngleValid) {
            faceContainerPaints.value[idx].setColor(Skia.Color('green'))
          } else {
            faceContainerPaints.value[idx].setColor(Skia.Color('red'))
          }

          frame.drawPath(faceContainerPath, faceContainerPaints.value[idx])

          frame.restore()

          if (isPitchAngleValid && isRollAngleValid && isYawAngleValid) {
            runAtTargetFps(1, () => {
              'worklet'

              try {
                const resized = resize(frame, {
                  scale: {
                    width: CROP_SIZE,
                    height: CROP_SIZE,
                  },
                  crop: {
                    x: face.bounds.x,
                    y: face.bounds.y,
                    width: face.bounds.width,
                    height: face.bounds.height,
                  },
                  pixelFormat: 'rgba',
                  dataType: 'uint8',
                  rotation: '90deg',
                })

                OpenCV.clearBuffers()

                // Create a Mat from the resized buffer.
                // We assume the resized buffer has length = CROP_SIZE * CROP_SIZE * 3.
                // We pass the new Uint8Array of the resized buffer.
                const mat = OpenCV.frameBufferToMat(
                  CROP_SIZE,
                  CROP_SIZE,
                  4,
                  new Uint8Array(resized.buffer),
                )

                // Create a destination Mat of the correct dimensions.
                const dst = OpenCV.createObject(
                  ObjectType.Mat,
                  CROP_SIZE,
                  CROP_SIZE,
                  DataTypes.CV_8U,
                )

                // Since our resized image is already CROP_SIZExCROP_SIZE,
                // the ROI for crop is the entire image (starting at 0,0).
                const roi = OpenCV.createObject(ObjectType.Rect, 0, 0, CROP_SIZE, CROP_SIZE)

                // Crop: mat -> dst using ROI.
                OpenCV.invoke('crop', mat, dst, roi)

                // const rgbMat = OpenCV.createObject(
                //   ObjectType.Mat,
                //   CROP_SIZE,
                //   CROP_SIZE,
                //   DataTypes.CV_8U,
                // )
                // OpenCV.invoke('cvtColor', mat, rgbMat, ColorConversionCodes.COLOR_BGR2RGB)
                //
                // const resBuff = OpenCV.matToBuffer(rgbMat, 'uint8')
                // onFaceResized(resBuff.buffer)

                // const result = OpenCV.toJSValue(rgbMat)

                const grayscaleMat = OpenCV.createObject(
                  ObjectType.Mat,
                  CROP_SIZE,
                  CROP_SIZE,
                  DataTypes.CV_8U,
                )
                OpenCV.invoke('cvtColor', mat, grayscaleMat, ColorConversionCodes.COLOR_RGBA2GRAY)

                const resBuff = OpenCV.matToBuffer(grayscaleMat, 'uint8')
                onFaceResized(new Uint8Array(resBuff.buffer))

                try {
                  const result = OpenCV.toJSValue(grayscaleMat, 'png')
                  updatePreviewImage(result.base64)
                } catch (error) {}

                OpenCV.clearBuffers()
              } catch (error) {
                console.error(error)
              }
            })
          }
        }
      })
    },
    [
      detectFaces,
      faceContainerPaints.value,
      handleFaceResized,
      scanProgressWorkletSharedValue.value,
    ],
  )

  const isActive = useMemo(() => {
    return isFocused && currentAppState === 'active'
  }, [currentAppState, isFocused])

  useEffect(() => {
    if (hasPermission) return

    requestPermission()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className='relative'>
      {hasPermission ? (
        <>
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
                  // animatedProps={zoomAnimatedProps}
                />
              </View>
            )}
          </>
        </>
      ) : (
        <>
          <View>
            <Text className='text-textPrimary typography-h4'>Requesting Camera Permission</Text>

            <UiButton onPress={requestPermission} title='Request Permission' />
          </View>
        </>
      )}

      {previewImage && (
        <UiImage
          className='absolute bottom-0 right-10 rounded-full'
          source={previewImage}
          style={{
            width: 112,
            height: 112,
          }}
        />
      )}
    </View>
  )
}
