import * as Slot from '@rn-primitives/slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { Platform, type Role, Text as RNText } from 'react-native'

import { cn } from '@/theme/utils'

const textVariants = cva(
  cn(
    'text-foreground text-base',
    Platform.select({
      web: 'select-text',
    }),
  ),
  {
    variants: {
      variant: {
        default: '',

        // Typography Button variants
        'button-large': cn('font-serif text-[20px] leading-6 tracking-[0.32px] font-medium'),
        'button-medium': cn('font-serif text-[18px] leading-5.5 tracking-[0.28px] font-medium'),
        'button-small': cn('font-serif text-[14px] leading-4.5 tracking-[0.24px] font-medium'),

        // Typography Caption variants
        caption1: cn('font-serif text-[14px] leading-4.5 font-medium'),
        caption2: cn('font-serif text-[12px] leading-4 font-medium'),
        caption3: cn('font-serif text-[10px] leading-3 font-medium'),

        // Typography Overline variants
        overline1: cn('font-serif text-[14px] leading-4.5 font-bold tracking-[0.56px]'),
        overline2: cn('font-serif text-[12px] leading-4 font-bold tracking-[0.48px]'),
        overline3: cn('font-serif text-[10px] leading-3 font-bold tracking-[0.4px]'),

        ['display-large']: cn(
          'font-sans not-italic font-normal text-[57px] leading-16 tracking-[-0.25px]',
        ),
        ['display-medium']: cn(
          'font-sans not-italic font-normal text-[45px] leading-13 tracking-[0px]',
        ),
        ['display-small']: cn(
          'font-sans not-italic font-normal text-[36px] leading-11 tracking-[0px]',
        ),

        ['headline-large']: cn(
          'font-sans not-italic font-normal text-[32px] leading-10 tracking-[0px]',
        ),
        ['headline-medium']: cn(
          'font-sans not-italic font-normal text-[28px] leading-9 tracking-[0px]',
        ),
        ['headline-small']: cn(
          'font-sans not-italic font-normal text-[24px] leading-8 tracking-[0px]',
        ),

        ['title-large']: cn(
          'font-sans not-italic font-medium text-[22px] leading-7 tracking-[0px]',
        ),
        ['title-medium']: cn(
          'font-sans not-italic font-medium text-[16px] leading-6 tracking-[0.15px]',
        ),
        ['title-small']: cn(
          'font-sans not-italic font-medium text-[14px] leading-5 tracking-[0.1px]',
        ),

        ['label-large']: cn(
          'font-serif not-italic font-medium text-[14px] leading-5 tracking-[0.1px]',
        ),
        ['label-medium']: cn(
          'font-serif not-italic font-medium text-[12px] leading-4 tracking-[0.5px]',
        ),
        ['label-small']: cn(
          'font-serif not-italic font-medium text-[11px] leading-4 tracking-[0.5px]',
        ),

        ['body-large']: cn(
          'font-serif not-italic font-normal text-[16px] leading-6 tracking-[0.5px]',
        ),
        ['body-medium']: cn(
          'font-serif not-italic font-normal text-[14px] leading-5 tracking-[0.25px]',
        ),
        ['body-small']: cn(
          'font-serif not-italic font-normal text-[12px] leading-4 tracking-[0.4px]',
        ),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type TextVariantProps = VariantProps<typeof textVariants>

type TextVariant = NonNullable<TextVariantProps['variant']>

const ROLE: Partial<Record<TextVariant, Role>> = {
  ['display-large']: 'heading',
  ['display-medium']: 'heading',
  ['display-small']: 'heading',
  ['title-large']: 'heading',
  ['title-medium']: 'heading',
  ['title-small']: 'heading',
}

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  ['display-large']: '1',
  ['display-medium']: '2',
  ['display-small']: '3',
  ['title-large']: '4',
  ['title-medium']: '5',
  ['title-small']: '6',
}

const TextClassContext = React.createContext<string | undefined>(undefined)

function Text({
  className,
  asChild = false,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps &
  React.RefAttributes<RNText> & {
    asChild?: boolean
  }) {
  const textClass = React.useContext(TextClassContext)
  const Component = asChild ? Slot.Text : RNText
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  )
}

export { Text as UiText, TextClassContext as UiTextClassContext }
