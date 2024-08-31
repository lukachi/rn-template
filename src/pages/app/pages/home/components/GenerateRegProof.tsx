import type { EDocument } from '@modules/e-document'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'

import { identityStore } from '@/store'
import { UiButton } from '@/ui'

export default function GenerateRegProof({ eDocument }: { eDocument: EDocument }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    isCircuitsLoaded,
    isCircuitsLoadFailed,
    circuitsDownloadingProgress,

    registerIdentity,
  } = identityStore.useIdentityRegistration(eDocument)

  const tryRegisterIdentity = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await registerIdentity()
    } catch (error) {
      console.log(error)
    }
    setIsSubmitting(false)
  }, [registerIdentity])

  return (
    <View>
      <Text className={'text-textPrimary typography-subtitle4'}>Downloading Progress:</Text>
      <Text className={'text-textPrimary typography-body3'}>{circuitsDownloadingProgress}</Text>

      <Text className={'text-textPrimary typography-subtitle4'}>isLoaded:</Text>
      <Text className={'text-textPrimary typography-body3'}>{String(isCircuitsLoaded)}</Text>

      <Text className={'text-textPrimary typography-subtitle4'}>isCircuitsLoadFailed:</Text>
      <Text className={'text-textPrimary typography-body3'}>{String(isCircuitsLoadFailed)}</Text>

      <UiButton title='Register' onPress={tryRegisterIdentity} disabled={isSubmitting} />
    </View>
  )
}
