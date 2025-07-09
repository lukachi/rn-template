import { Text, View } from 'react-native'

import { useDocumentScanContext } from '@/pages/app/pages/document-scan/ScanProvider'

export default function GenerateProofStep() {
  const { circuitLoadingDetails } = useDocumentScanContext()

  return (
    <View className='flex-1 p-5'>
      <View>
        <Text className='text-textPrimary typography-subtitle4'>Downloading Progress:</Text>
        <Text className='text-textPrimary typography-body3'>
          {circuitLoadingDetails?.downloadingProgress}
        </Text>

        <Text className='text-textPrimary typography-subtitle4'>isLoaded:</Text>
        <Text className='text-textPrimary typography-body3'>
          {String(circuitLoadingDetails?.isLoaded)}
        </Text>

        <Text className='text-textPrimary typography-subtitle4'>isCircuitsLoadFailed:</Text>
        <Text className='text-textPrimary typography-body3'>
          {String(circuitLoadingDetails?.isLoadFailed)}
        </Text>
      </View>
    </View>
  )
}
