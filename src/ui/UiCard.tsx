import { View, type ViewProps } from 'react-native'

import { cn } from '@/theme/utils'

import { UiText, UiTextClassContext } from './UiText'

function Card({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  return (
    <UiTextClassContext.Provider value='text-card-foreground'>
      <View
        className={cn(
          'border-border bg-card flex flex-col gap-6 rounded-2xl border py-6 shadow-sm shadow-black/5',
          className,
        )}
        {...props}
      />
    </UiTextClassContext.Provider>
  )
}

function CardHeader({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className={cn('flex flex-col gap-1.5 px-6', className)} {...props} />
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof UiText> & React.RefAttributes<Text>) {
  return (
    <UiText
      role='heading'
      aria-level={3}
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof UiText> & React.RefAttributes<Text>) {
  return <UiText className={cn('text-muted-foreground text-sm', className)} {...props} />
}

function CardContent({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className={cn('px-6', className)} {...props} />
}

function CardFooter({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className={cn('flex flex-row items-center px-6', className)} {...props} />
}

export {
  Card as UiCard,
  CardContent as UiCardContent,
  CardDescription as UiCardDescription,
  CardFooter as UiCardFooter,
  CardHeader as UiCardHeader,
  CardTitle as UiCardTitle,
}
