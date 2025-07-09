import { Image } from 'expo-image'
import { Text, View } from 'react-native'

import AppContainer from '@/pages/app/components/AppContainer'
import { useDocumentScanContext } from '@/pages/app/pages/document-scan/ScanProvider'
import { UiButton, UiCard, UiHorizontalDivider } from '@/ui'

export default function DocumentPreviewStep() {
  const { tempEDoc, createIdentity } = useDocumentScanContext()

  if (!tempEDoc?.personDetails) return null

  const { firstName, lastName, gender, passportImageRaw, ...restDetails } = tempEDoc.personDetails

  return (
    <AppContainer className='pb-20'>
      <View className='flex-1 flex-col gap-4 p-5'>
        <UiCard>
          <View className='flex flex-row'>
            <View className='flex flex-1 flex-col gap-2'>
              <Text className='text-textPrimary'>{`${firstName} ${lastName}`}</Text>
              <Text className='text-textPrimary'>{gender}</Text>
            </View>

            <Image
              style={{ width: 120, height: 120, borderRadius: 1000 }}
              source={{
                uri: `data:image/png;base64,${passportImageRaw}`,
              }}
            />
          </View>
        </UiCard>

        <View className='mt-6 flex flex-col gap-4'>
          {restDetails &&
            Object.keys(restDetails).map(key => {
              return (
                <View key={key} className='flex flex-row items-center justify-between gap-2'>
                  <Text className='capitalize text-textPrimary typography-body3'>{key}</Text>
                  <Text className='text-textPrimary typography-subtitle4'>
                    {restDetails?.[key as keyof typeof tempEDoc.personDetails]}
                  </Text>
                </View>
              )
            })}

          <View className='flex flex-row items-center justify-between gap-2'>
            <Text className='capitalize text-textPrimary typography-body3'>dg1</Text>
            <Text className='text-textPrimary typography-subtitle4'>
              {tempEDoc.dg1Bytes.length} length
            </Text>
          </View>

          <View className='flex flex-row items-center justify-between gap-2'>
            <Text className='capitalize text-textPrimary typography-body3'>dg11</Text>
            <Text className='text-textPrimary typography-subtitle4'>
              {tempEDoc.dg11Bytes?.length} length
            </Text>
          </View>

          <View className='flex flex-row items-center justify-between gap-2'>
            <Text className='capitalize text-textPrimary typography-body3'>dg15</Text>
            <Text className='text-textPrimary typography-subtitle4'>
              {tempEDoc.dg15Bytes?.length ?? 0} length
            </Text>
          </View>

          <View className='flex flex-row items-center justify-between gap-2'>
            <Text className='capitalize text-textPrimary typography-body3'>signature</Text>
            <Text className='text-textPrimary typography-subtitle4'>
              {tempEDoc?.aaSignature?.length ?? 0} length
            </Text>
          </View>
        </View>

        <View className='mt-auto'>
          <UiHorizontalDivider className='my-5' />
          <UiButton title='Generate Proof' onPress={createIdentity} />
        </View>
      </View>
    </AppContainer>
  )
}
