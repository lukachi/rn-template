import { Text, View } from 'react-native'

import { useDocumentScanContext } from '@/pages/app/pages/document-scan/context'

export default function GenerateProofStep() {
  const { identityCreationProcess } = useDocumentScanContext()

  return (
    <View className='flex-1 p-5'>
      <Text>{identityCreationProcess}</Text>
    </View>
  )
}
