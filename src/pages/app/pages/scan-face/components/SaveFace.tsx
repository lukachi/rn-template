import { execTFLite } from '@modules/tf-exec'
import { useCallback, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useSharedValue as useWorkletSharedValue } from 'react-native-worklets-core'

import { ErrorHandler } from '@/core'
import ScanFaceCamera from '@/pages/app/pages/scan-face/components/ScanFaceCamera'
import { useScanFaceContext } from '@/pages/app/pages/scan-face/context'
import { UiButton } from '@/ui'

type Props = {
  onFaceSaved: () => void
}

export default function SaveFace({ onFaceSaved }: Props) {
  const { firstFeatureVectors, arcFaceAsset } = useScanFaceContext()

  const [isProcessed, setIsProcessed] = useState(false)

  const resizedImages = useWorkletSharedValue<Uint8Array<ArrayBufferLike>[]>([])

  const handleFaceResized = useCallback(
    async (resized: Uint8Array<ArrayBufferLike>) => {
      console.log('handleFaceResized')
      if (!arcFaceAsset.localUri) return

      try {
        console.log(resized.length)

        const featVec = await execTFLite(
          arcFaceAsset.localUri,
          resized.map(el => el / 255),
        )
        firstFeatureVectors.value = featVec

        setIsProcessed(true)

        // onFaceSaved()
      } catch (error) {
        ErrorHandler.processWithoutFeedback(error)
      }
    },
    [arcFaceAsset.localUri, firstFeatureVectors],
  )

  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ScanFaceCamera
          onFaceResized={resized => {
            if (isProcessed) return

            if (resizedImages.value.length < 5) {
              resizedImages.value.push(resized)

              return
            }

            handleFaceResized(resized)
          }}
        />
        <View className='flex-1'>
          <Text className='mt-8 text-center typography-subtitle1'>Saving face</Text>

          {isProcessed && (
            <UiButton
              title='re-Try'
              onPress={() => {
                setIsProcessed(false)
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  )
}
