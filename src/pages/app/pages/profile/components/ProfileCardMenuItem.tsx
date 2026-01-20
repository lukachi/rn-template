import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react-native'
import { ReactNode } from 'react'
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native'

import { isRTL } from '@/core'
import { cn } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'
import { UiText } from '@/ui/UiText'

type ProfileCardMenuItemProps = {
  leadingIcon: ReactNode
  trailingIcon?: ReactNode
  title: string
  trailingContent?: ReactNode
} & Omit<TouchableOpacityProps, 'children'>

export function ProfileCardMenuItem({
  leadingIcon,
  trailingIcon,
  title,
  trailingContent,
  className,
  ...rest
}: ProfileCardMenuItemProps) {
  return (
    <TouchableOpacity
      {...rest}
      className={cn('flex w-full flex-row items-center gap-2 py-2', className)}
    >
      <View className='bg-accent flex aspect-square size-8 items-center justify-center rounded-full'>
        {leadingIcon}
      </View>

      <UiText variant='body-medium' className={cn('text-foreground mr-auto')}>
        {title}
      </UiText>

      {trailingContent}

      {trailingIcon || (
        <UiLucideIcon
          as={isRTL ? ChevronLeftIcon : ChevronRightIcon}
          className='text-foreground ml-2'
          size={14}
        />
      )}
    </TouchableOpacity>
  )
}
