import { Image } from 'expo-image'
import { Text, View } from 'react-native'

import { useDocumentScanContext } from '@/pages/app/pages/document-scan/context'
import { UiButton, UiCard, UiHorizontalDivider } from '@/ui'

export default function DocumentPreviewStep() {
  const { eDoc, createIdentity } = useDocumentScanContext()

  if (!eDoc?.personDetails) return null

  const { firstName, lastName, gender, passportImageRaw, ...restDetails } = eDoc.personDetails

  return (
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
                  {restDetails?.[key as keyof typeof eDoc.personDetails]}
                </Text>
              </View>
            )
          })}

        <View className='flex flex-row items-center justify-between gap-2'>
          <Text className='capitalize text-textPrimary typography-body3'>dg1</Text>
          <Text className='text-textPrimary typography-subtitle4'>
            {eDoc?.dg1?.length ?? 0} length
          </Text>
        </View>

        <View className='flex flex-row items-center justify-between gap-2'>
          <Text className='capitalize text-textPrimary typography-body3'>dg11</Text>
          <Text className='text-textPrimary typography-subtitle4'>
            {eDoc?.dg11?.length ?? 0} length
          </Text>
        </View>

        <View className='flex flex-row items-center justify-between gap-2'>
          <Text className='capitalize text-textPrimary typography-body3'>dg15</Text>
          <Text className='text-textPrimary typography-subtitle4'>
            {eDoc?.dg15?.length ?? 0} length
          </Text>
        </View>

        <View className='flex flex-row items-center justify-between gap-2'>
          <Text className='capitalize text-textPrimary typography-body3'>signature</Text>
          <Text className='text-textPrimary typography-subtitle4'>
            {eDoc?.signature?.length ?? 0} length
          </Text>
        </View>
      </View>

      <View className='mt-auto'>
        <UiHorizontalDivider className='my-5' />
        <UiButton title='Generate Proof' onPress={createIdentity} />
      </View>
    </View>
  )
}
