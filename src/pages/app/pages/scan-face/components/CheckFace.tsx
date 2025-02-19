import { execTFLite } from '@modules/tf-exec'
import { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSharedValue as useWorkletSharedValue, Worklets } from 'react-native-worklets-core'

import { ErrorHandler } from '@/core'
import ScanFaceCamera from '@/pages/app/pages/scan-face/components/ScanFaceCamera'
import { useScanFaceContext } from '@/pages/app/pages/scan-face/context'
import { UiButton } from '@/ui'

type Props = {
  onFaceChecked: () => void
}

function calculateCosineSimilarity(lhsFeature: Uint8Array, rhsFeature: Uint8Array): number | null {
  if (lhsFeature.length !== rhsFeature.length) {
    return null
  }

  const squaredDifferences = lhsFeature.map((v1, index) => {
    const v2 = rhsFeature[index]
    return (v2 - v1) * (v2 - v1)
  })

  return squaredDifferences.reduce((sum, diff) => sum + diff, 0)
}

export default function CheckFace({ onFaceChecked }: Props) {
  const insets = useSafeAreaInsets()

  const { firstFeatureVectors, secondFeatureVectors, arcFaceAsset } = useScanFaceContext()

  const isProcessed = useWorkletSharedValue(false)

  const [similarity, setSimilarity] = useState(0)

  const handleFaceResized = useMemo(
    () =>
      Worklets.createRunOnJS(async (resized: Uint8Array<ArrayBufferLike>) => {
        if (!arcFaceAsset?.localUri) return

        isProcessed.value = true

        try {
          const featVec = await execTFLite(
            arcFaceAsset.localUri,
            resized.map(el => el / 255),
          )
          secondFeatureVectors.value = featVec

          const similarity = calculateCosineSimilarity(featVec, firstFeatureVectors.value)

          setSimilarity(similarity ?? 0)

          // onFaceChecked()
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      }),
    [arcFaceAsset.localUri, firstFeatureVectors.value, isProcessed, secondFeatureVectors],
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
            if (isProcessed.value) return

            handleFaceResized(resized)
          }}
        />
        <View className='flex-1'>
          <Text className='mt-8 text-center typography-subtitle1'>Check face</Text>
          <Text className='mt-8 text-center typography-subtitle2'>{similarity}</Text>

          <UiButton
            title='re-Check'
            onPress={() => {
              isProcessed.value = false
            }}
          />
        </View>
      </ScrollView>
    </View>
  )
}
