import type { ViewProps } from 'react-native'
import { View } from 'react-native'

type Props = {
  length: number
} & ViewProps

export default function HiddenPasscodeView({ length }: Props) {
  return (
    <View className='flex h-[16] flex-row items-center gap-2'>
      {Array.from({ length }).map((_, i) => (
        <View key={i} className='size-[16] rounded-full bg-textPrimary' />
      ))}
    </View>
  )
}
