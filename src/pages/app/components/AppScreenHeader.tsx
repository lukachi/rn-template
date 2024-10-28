import type { ViewProps } from 'react-native'
import { Text, View } from 'react-native'

type Props = {
  title: string
} & ViewProps

export default function AppScreenHeader({ title, ...rest }: Props) {
  return (
    <View {...rest}>
      <Text className='text-textPrimary typography-h5'>{title}</Text>
    </View>
  )
}
