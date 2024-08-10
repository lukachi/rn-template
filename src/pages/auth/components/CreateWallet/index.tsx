import { useNavigation } from '@react-navigation/native'
import { useMemo } from 'react'
import type { ViewProps } from 'react-native'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { AuthStackScreenProps } from '@/route-types'
import { UiButton } from '@/ui'

type Props = ViewProps & AuthStackScreenProps<'CreateWallet'>

export default function CreateWallet({ route }: Props) {
  const isImporting = useMemo(() => {
    return route?.params?.isImporting
  }, [route])

  const navigation = useNavigation()

  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className='flex flex-1 flex-col'
    >
      <View className='flex w-full flex-row'>
        <UiButton
          leadingIcon='arrowLeftIcon'
          variant='text'
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
      <View className='flex w-full flex-1 flex-row bg-errorDark px-5'>
        <UiButton title={isImporting ? 'Import Key' : 'Create Key'} className='mt-auto w-full' />
      </View>
    </View>
  )
}
