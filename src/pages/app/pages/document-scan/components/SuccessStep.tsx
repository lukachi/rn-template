import { Text, View } from 'react-native'

import { useDocumentScanContext } from '@/pages/app/pages/document-scan/context'
import { UiCard } from '@/ui'

export default function DocumentPreviewStep() {
  const { eDoc, regProof } = useDocumentScanContext()

  try {
    return (
      <View className={'flex-1 flex-col gap-4 p-5'}>
        <UiCard>
          <Text>{JSON.stringify(eDoc)?.length}</Text>
        </UiCard>
        <UiCard>
          <Text>{JSON.stringify(regProof)?.length}</Text>
        </UiCard>
      </View>
    )
  } catch (error) {
    return (
      <View className={'flex-1 flex-col gap-4 p-5'}>
        <UiCard>
          <Text>Just finished</Text>
        </UiCard>
      </View>
    )
  }
}
