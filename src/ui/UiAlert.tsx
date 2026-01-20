import type { LucideIcon } from 'lucide-react-native'
import * as React from 'react'
import { View, type ViewProps } from 'react-native'

import { cn } from '@/theme/utils'
import { UiLucideIcon } from '@/ui/icons/UiLucideIcon'

import { UiText, UiTextClassContext } from './UiText'

function Alert({
  className,
  variant,
  children,
  icon,
  iconClassName,
  ...props
}: ViewProps &
  React.RefAttributes<View> & {
    icon: LucideIcon
    variant?: 'default' | 'destructive'
    iconClassName?: string
  }) {
  return (
    <UiTextClassContext.Provider
      value={cn('text-sm text-foreground', variant === 'destructive' && 'text-danger', className)}
    >
      <View
        role='alert'
        className={cn(
          'border-border bg-surface relative w-full rounded-lg border px-4 pt-3.5 pb-2',
          className,
        )}
        {...props}
      >
        <View className='absolute top-3 left-3.5'>
          <UiLucideIcon
            as={icon}
            className={cn(
              'text-foreground',
              variant === 'destructive' && 'text-danger',
              iconClassName,
            )}
            size={16}
          />
        </View>
        {children}
      </View>
    </UiTextClassContext.Provider>
  )
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<typeof UiText> & React.RefAttributes<Text>) {
  return (
    <UiText
      className={cn('mb-1 ml-0.5 min-h-4 pl-6 leading-none font-medium tracking-tight', className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<typeof UiText> & React.RefAttributes<Text>) {
  const textClass = React.useContext(UiTextClassContext)
  return (
    <UiText
      className={cn(
        'text-muted ml-0.5 pb-1.5 pl-6 text-sm leading-relaxed',
        textClass?.includes('text-danger') && 'text-danger/90',
        className,
      )}
      {...props}
    />
  )
}

export { Alert as UiAlert, AlertDescription as UiAlertDescription, AlertTitle as UiAlertTitle }
