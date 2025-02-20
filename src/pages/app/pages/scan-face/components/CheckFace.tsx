import { execTFLite } from '@modules/tf-exec'
import { Buffer } from 'buffer'
import { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Worklets } from 'react-native-worklets-core'

import { ErrorHandler } from '@/core'
import ScanFaceCamera from '@/pages/app/pages/scan-face/components/ScanFaceCamera'
import { useScanFaceContext } from '@/pages/app/pages/scan-face/context'
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
  const insets = useSafeAreaInsets()

  const { firstFeatureVectors, setSecondFeatureVectors, arcFaceAsset } = useScanFaceContext()

  const [isProcessed, setIsProcessed] = useState(false)

  const [similarity, setSimilarity] = useState(0)

  const handleFaceResized = useMemo(
    () =>
      Worklets.createRunOnJS(async (resized: Uint8Array<ArrayBufferLike>) => {
        if (!arcFaceAsset?.localUri || isProcessed) return

        try {
          const normalized = Object.values(JSON.parse(JSON.stringify(resized))).map(el =>
            String(Number(el) / 255),
          )

          const featVec = await execTFLite(arcFaceAsset.localUri, normalized)
          setSecondFeatureVectors(featVec)

          console.log(Buffer.from(firstFeatureVectors).toJSON(), Buffer.from(featVec).toJSON())

          const similarity = calculateCosineSimilarity(
            normalizeArcFaceOutput(firstFeatureVectors),
            normalizeArcFaceOutput(featVec),
          )

          console.log('similarity', similarity)

          setSimilarity(similarity ?? 0)

          setIsProcessed(true)
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      }),
    [arcFaceAsset.localUri, firstFeatureVectors, isProcessed, setSecondFeatureVectors],
  )

  return (
    <View
      className='flex flex-1 flex-col'
      style={{
        paddingTop: insets.top,
      }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ScanFaceCamera
          onFaceResized={resized => {
            'worklet'

            handleFaceResized(resized)
          }}
        />
        <View className='flex flex-1 gap-4 px-4'>
          <Text className='mt-8 text-center typography-subtitle1'>Check face</Text>
          <Text className='mt-8 text-center typography-subtitle2'>{similarity}</Text>

          <UiButton
            title='re-Check'
            onPress={() => {
              setIsProcessed(false)
            }}
          />

          {!!similarity && (
            <UiButton
              title='Next'
              onPress={() => {
                onFaceChecked()
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  )
}
