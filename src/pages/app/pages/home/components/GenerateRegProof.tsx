import type { EDocument } from '@modules/e-document'
import { useCallback } from 'react'
import { View } from 'react-native'

import { documentsStore } from '@/store'
import { UiButton } from '@/ui'

export default function GenerateRegProof({ eDocument }: { eDocument: EDocument }) {
  const { registerIdentity } = documentsStore.useIdentityRegistration(eDocument)

  const tryRegisterIdentity = useCallback(async () => {
    console.log('tryRegisterIdentity')
    try {
      await registerIdentity()
    } catch (error) {
      console.log(error)
    }
  }, [registerIdentity])

  return (
    <View>
      <UiButton title='Register' onPress={tryRegisterIdentity} />
    </View>
  )
}
