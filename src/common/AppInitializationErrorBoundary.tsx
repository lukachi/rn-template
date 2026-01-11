import { FileWarningIcon } from 'lucide-react-native'
import type { ViewProps } from 'react-native'
import { Text, View } from 'react-native'

import { cn } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'

type Props = {
  error: Error
} & ViewProps

export default function AppInitializationErrorBoundary({ className, ...rest }: Props) {
  return (
    <View
      {...rest}
      className={cn('bg-backgroundPrimary flex flex-1 items-center justify-center', className)}
    >
      <UiLucideIcon as={FileWarningIcon} className='text-danger' />

      <Text className='typography-h5 text-textPrimary mt-4 text-center'>Something went wrong.</Text>
      <Text className='typography-body1 text-textSecondary mt-4 text-center'>
        Please try again later.
      </Text>
    </View>
  )
}
