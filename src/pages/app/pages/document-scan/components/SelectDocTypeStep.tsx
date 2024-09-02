import { DocType } from '@modules/e-document'
import { Pressable, ScrollView, Text, View } from 'react-native'

import { useDocumentScanContext } from '@/pages/app/pages/document-scan/context'
import { UiCard, UiIcon } from '@/ui'

export default function SelectDocTypeStep() {
  const { setDocType } = useDocumentScanContext()

  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='flex flex-1 flex-col gap-4 p-5'>
          <Text className={'my-4 text-center text-textPrimary typography-h4'}>
            Select doc type step
          </Text>

          <View className='flex flex-col gap-5'>
            <Pressable
              onPress={() => {
                setDocType(DocType.PASSPORT)
              }}
            >
              <UiCard className={'flex flex-row items-center gap-2'}>
                <UiIcon componentName={'starFillIcon'} className={'text-textPrimary'} />
                <Text className='text-textPrimary typography-subtitle4'>Passport</Text>
              </UiCard>
            </Pressable>

            <Pressable
              onPress={() => {
                setDocType(DocType.ID)
              }}
            >
              <UiCard className={'flex flex-row items-center gap-2'}>
                <UiIcon componentName={'cardholderIcon'} className={'text-textPrimary'} />
                <Text className='text-textPrimary typography-subtitle4'>ID CARD</Text>
              </UiCard>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}