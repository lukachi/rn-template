import { Text, View } from 'react-native'

import { useDocumentScanContext } from '@/pages/app/pages/document-scan/ScanProvider'

export default function GenerateProofStep() {
  const { circuitData } = useDocumentScanContext()

  return (
    <View className='flex-1 p-5'>
      <View>
        <Text className='text-textPrimary typography-subtitle4'>Downloading Progress:</Text>
        <Text className='text-textPrimary typography-body3'>
          {circuitData?.downloadingProgress}
        </Text>

        <Text className='text-textPrimary typography-subtitle4'>isLoaded:</Text>
        <Text className='text-textPrimary typography-body3'>{String(circuitData?.isLoaded)}</Text>

        <Text className='text-textPrimary typography-subtitle4'>isCircuitsLoadFailed:</Text>
        <Text className='text-textPrimary typography-body3'>
          {String(circuitData?.isLoadFailed)}
        </Text>
      </View>
    </View>
  )
}
