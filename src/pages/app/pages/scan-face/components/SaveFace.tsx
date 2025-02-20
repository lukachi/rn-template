import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Worklets } from 'react-native-worklets-core'

import { ErrorHandler } from '@/core'
import ScanFaceCamera from '@/pages/app/pages/scan-face/components/ScanFaceCamera'
import { useScanFaceContext } from '@/pages/app/pages/scan-face/context'
import { UiButton } from '@/ui'

type Props = {
  onFaceSaved: () => void
}

export default function SaveFace({ onFaceSaved }: Props) {
  const { firstFeatureVectors, setFirstFeatureVectors, getFaceFeatureVectors, arcFaceAsset } =
    useScanFaceContext()

  const handleFaceResized = useMemo(
    () =>
      Worklets.createRunOnJS(async (resized: Uint8Array<ArrayBufferLike>) => {
        if (!arcFaceAsset.localUri) return

        try {
          const featVec = await getFaceFeatureVectors(resized)
          setFirstFeatureVectors(featVec)
        } catch (error) {
          ErrorHandler.processWithoutFeedback(error)
        }
      }),
    [arcFaceAsset.localUri, getFaceFeatureVectors, setFirstFeatureVectors],
  )

  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ScanFaceCamera
          onFaceResized={resized => {
            'worklet'

            // if (resizedImages.value.length < 5) {
            //   resizedImages.value.push(resized)
            //
            //   return
            // }

            handleFaceResized(resized)
          }}
        />
        <View className='flex flex-1 gap-2 px-4'>
          <Text className='mt-8 text-center typography-subtitle1'>Saving face</Text>

          {firstFeatureVectors && <UiButton title='Next' onPress={onFaceSaved} />}
        </View>
      </ScrollView>
    </View>
  )
}
