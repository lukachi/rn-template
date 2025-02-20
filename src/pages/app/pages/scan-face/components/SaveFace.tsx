import { execTFLite } from '@modules/tf-exec'
import { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSharedValue as useWorkletSharedValue, Worklets } from 'react-native-worklets-core'

import { ErrorHandler } from '@/core'
import ScanFaceCamera from '@/pages/app/pages/scan-face/components/ScanFaceCamera'
import { useScanFaceContext } from '@/pages/app/pages/scan-face/context'
import { UiButton } from '@/ui'

type Props = {
  onFaceSaved: () => void
}

export default function SaveFace({ onFaceSaved }: Props) {
  const { firstFeatureVectors, setFirstFeatureVectors, arcFaceAsset } = useScanFaceContext()

  const [isProcessed, setIsProcessed] = useState(false)

  const resizedImages = useWorkletSharedValue<Uint8Array<ArrayBufferLike>[]>([])

  const handleFaceResized = useMemo(
    () =>
      Worklets.createRunOnJS(async (resized: Uint8Array<ArrayBufferLike>) => {
        if (!arcFaceAsset.localUri || isProcessed) return

        try {
          const normalized = Object.values(JSON.parse(JSON.stringify(resized))).map(el =>
            String(Number(el) / 255),
          )

          const featVec = await execTFLite(arcFaceAsset.localUri, normalized)
          setFirstFeatureVectors(featVec)

          setIsProcessed(true)
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      }),
    [arcFaceAsset.localUri, isProcessed, setFirstFeatureVectors],
  )

  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ScanFaceCamera
          onFaceResized={resized => {
            'worklet'

            if (resizedImages.value.length < 5) {
              resizedImages.value.push(resized)

              return
            }

            handleFaceResized(resized)
          }}
        />
        <View className='flex flex-1 gap-2 px-4'>
          <Text className='mt-8 text-center typography-subtitle1'>Saving face</Text>

          {isProcessed && (
            <UiButton
              title='re-Try'
              onPress={() => {
                setIsProcessed(false)
              }}
            />
          )}

          {firstFeatureVectors && <UiButton title='Next' onPress={onFaceSaved} />}
        </View>
      </ScrollView>
    </View>
  )
}
