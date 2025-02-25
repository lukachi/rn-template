import { useAppState } from '@react-native-community/hooks'
import Slider from '@react-native-community/slider'
import { useIsFocused } from '@react-navigation/native'
import { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Worklets } from 'react-native-worklets-core'

import { ErrorHandler } from '@/core'
import ScanFaceCamera from '@/pages/app/pages/scan-face/components/ScanFaceCamera'
import { useScanFaceContext } from '@/pages/app/pages/scan-face/context'
import { cn, useAppTheme } from '@/theme'
import { UiButton } from '@/ui'

type Props = {
  onFaceChecked: () => void
}

function normalizeArcFaceOutput(outputTensor: Uint8Array): number[] {
  // Interpret the buffer as Float32 data
  const outputArrayFloat = new Float32Array(outputTensor)

  // Calculate the sum of squares
  const sumOfSquares = outputArrayFloat.reduce((sum, value) => sum + value * value, 0)

  // Normalize each element by dividing by the square root of the sum of squares
  return Array.from(outputArrayFloat, value => value / Math.sqrt(sumOfSquares))
}

function calculateCosineSimilarity(lhsFeature: number[], rhsFeature: number[]): number | null {
  if (lhsFeature.length !== rhsFeature.length) {
    throw new Error('Vectors must be of the same length')
  }

  return lhsFeature.reduce((sum, v1, index) => sum + Math.pow(v1 - rhsFeature[index], 2), 0)
}

export default function CheckFace({ onFaceChecked }: Props) {
  const isFocused = useIsFocused()
  const currentAppState = useAppState()

  const { palette } = useAppTheme()
  const insets = useSafeAreaInsets()

  const { firstFeatureVectors, setSecondFeatureVectors, getFaceFeatureVectors, arcFaceAsset } =
    useScanFaceContext()

  const [similarity, setSimilarity] = useState(0)
  const [threshold, setThreshold] = useState(0.3)

  const handleFaceResized = useMemo(
    () =>
      Worklets.createRunOnJS(async (resized: Uint8Array<ArrayBufferLike>) => {
        if (!arcFaceAsset?.localUri) return

        try {
          console.log('\n\n\n\n\n\nSecond Face:')
          const featVec = await getFaceFeatureVectors(resized)
          setSecondFeatureVectors(featVec)

          const normalizedFirstFeatureVectors = normalizeArcFaceOutput(firstFeatureVectors)
          const normalizedSecondFeatureVectors = normalizeArcFaceOutput(featVec)

          console.log(
            JSON.stringify({
              normalizedFirstFeatureVectors,
              normalizedSecondFeatureVectors,
            }),
          )

          const similarity = calculateCosineSimilarity(
            normalizedFirstFeatureVectors,
            normalizedSecondFeatureVectors,
          )

          setSimilarity(similarity ?? 0)
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      }),
    [arcFaceAsset?.localUri, firstFeatureVectors, getFaceFeatureVectors, setSecondFeatureVectors],
  )

  return (
    <View
      className='flex flex-1 flex-col'
      style={{
        paddingTop: insets.top,
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {isFocused && currentAppState === 'active' && (
          <ScanFaceCamera
            onFaceResized={resized => {
              'worklet'

              handleFaceResized(resized)
            }}
          />
        )}
        <View className='flex flex-1 gap-4 px-4'>
          <Text className='mt-8 text-center typography-subtitle1'>Check face</Text>
          <Text
            className={cn(
              'mt-8 text-center typography-subtitle2',
              Number(similarity) <= Number(threshold) ? 'text-successMain' : 'text-errorMain',
            )}
          >
            {similarity}
          </Text>

          {!!similarity && (
            <UiButton
              title='Next'
              onPress={() => {
                onFaceChecked()
              }}
            />
          )}

          <View className='flex items-center gap-2'>
            <Text className='self-start text-textPrimary typography-subtitle3'>
              Threshold: {threshold.toFixed(1)}
            </Text>
            <Slider
              style={{ flex: 1, width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={1}
              step={0.1}
              onValueChange={setThreshold}
              value={threshold}
              thumbTintColor={palette.primaryMain}
              minimumTrackTintColor={palette.primaryMain}
              maximumTrackTintColor={palette.primaryMain}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
