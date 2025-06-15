import { useNavigation } from '@react-navigation/native'
import { Text, View } from 'react-native'

import { useDocumentScanContext } from '@/pages/app/pages/document-scan/ScanProvider'
import { UiButton, UiCard } from '@/ui'

export default function DocumentPreviewStep() {
  const { eDoc, regProof } = useDocumentScanContext()

  const navigation = useNavigation()

  return (
    <View className='flex-1 flex-col gap-4 p-5'>
      <UiCard>
        <Text className='text-textPrimary'>{JSON.stringify(eDoc)?.length}</Text>
      </UiCard>
      <UiCard>
        <Text className='text-textPrimary'>{JSON.stringify(regProof)?.length}</Text>
      </UiCard>

      <UiButton
        title='Okay'
        className='mt-auto w-full'
        onPress={() => {
          navigation.navigate('App', {
            screen: 'Tabs',
          })
        }}
      />
    </View>
  )
}
