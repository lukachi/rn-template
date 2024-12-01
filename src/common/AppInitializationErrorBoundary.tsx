import type { ViewProps } from 'react-native'
import { Text, View } from 'react-native'

import { cn, useAppTheme } from '@/theme'
import { UiIcon } from '@/ui'

type Props = {
  error: Error
} & ViewProps

export default function AppInitializationErrorBoundary({ error, className, ...rest }: Props) {
  const { palette } = useAppTheme()

  console.log(error)

  return (
    <View
      {...rest}
      className={cn('flex flex-1 items-center justify-center bg-backgroundPrimary', className)}
    >
      <UiIcon libIcon='AntDesign' name='warning' size={170} color={palette.errorMain} />

      <Text className='mt-4 text-center text-textPrimary typography-h5'>Something went wrong.</Text>
      <Text className='mt-4 text-center text-textSecondary typography-body1'>
        Please try again later.
      </Text>
    </View>
  )
}
