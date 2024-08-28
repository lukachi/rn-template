import { DocType } from '@modules/e-document'
import type { FieldRecords } from 'mrz'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'

import { UiButton } from '@/ui'

import { CameraWrapper, DocumentReader } from './components'

export default function HomeScreen() {
  const [isScanStarted, setIsScanStarted] = useState(false)
  const [docType, setDocType] = useState<DocType>()

  const [mrz, setMrz] = useState<FieldRecords>()

  return (
    <View className='flex flex-1 flex-col'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='flex flex-1 flex-col gap-4 p-5'>
          {isScanStarted ? (
            <>
              {mrz ? (
                <DocumentReader fields={mrz} />
              ) : (
                <>{docType && <CameraWrapper docType={docType} setParseResult={setMrz} />}</>
              )}
            </>
          ) : (
            <View className='flex flex-1 flex-col gap-5'>
              <UiButton
                title='Passport'
                onPress={() => {
                  setDocType(DocType.PASSPORT)
                  setIsScanStarted(true)
                }}
              />
              <UiButton
                title='ID CARD'
                onPress={() => {
                  setDocType(DocType.ID)
                  setIsScanStarted(true)
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
