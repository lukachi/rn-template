import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { forwardRef, useCallback, useMemo, useState } from 'react'
import type { GestureResponderEvent, PressableProps } from 'react-native'
import { Pressable, Text, View } from 'react-native'
import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

import { cn } from '@/theme'
import UiIcon from '@/ui/UiIcon'

const buttonBaseTv = tv({
  slots: {
    container: cn('flex flex-row justify-center items-center'),
    text: cn(''),
    icon: cn(''),
  },

  variants: {
    size: {
      small: {
        container: cn('h-[32px] px-[16px] rounded-[1000px] gap-2'),
        text: cn('typography-bodySmall'),
        icon: cn('size-[16px]'),
      },
      medium: {
        container: cn('h-[40px] px-[24px] rounded-[1000px] gap-4'),
        text: cn('typography-bodyMedium'),
        icon: cn('size-[20px]'),
      },
      large: {
        container: cn('h-[56px] px-[32px] rounded-full gap-6'),
        text: cn('typography-bodyLarge'),
        icon: cn('size-[20px]'),
      },
    },

    variant: {
      filled: {},
      outlined: {
        container: cn('border border-solid'),
      },
      text: {
        container: cn('bg-transparent'),
      },
    },

    color: {
      text: '',
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      error: '',
    },

    disabled: {
      true: {},
    },
    pressed: {
      true: {},
    },
  },

  compoundVariants: [
    /* filled */

    // filled-primary
    {
      variant: 'filled',
      color: 'primary',
      class: {
        container: cn('bg-primaryMain'),
        text: cn('text-baseWhite'),
        icon: cn('text-baseWhite'),
      },
    },
    {
      variant: 'filled',
      color: 'primary',
      pressed: true,
      class: {
        container: cn('bg-primaryDarker'),
      },
    },

    // filled-secondary
    {
      variant: 'filled',
      color: 'secondary',
      class: {
        container: cn('bg-secondaryMain'),
        text: cn('text-baseBlack'),
        icon: cn('text-baseBlack'),
      },
    },
    {
      variant: 'filled',
      color: 'secondary',
      pressed: true,
      class: {
        container: cn('bg-secondaryDarker'),
      },
    },

    // filled-success
    {
      variant: 'filled',
      color: 'success',
      class: {
        container: cn('bg-successMain'),
        text: cn('text-baseWhite'),
        icon: cn('text-baseWhite'),
      },
    },
    {
      variant: 'filled',
      color: 'success',
      pressed: true,
      class: {
        container: cn('bg-successDarker'),
      },
    },

    // filled-error
    {
      variant: 'filled',
      color: 'error',
      pressed: true,
      class: {
        container: cn('bg-errorDarker'),
      },
    },
    {
      variant: 'filled',
      color: 'error',
      class: {
        container: cn('bg-errorMain'),
        text: cn('text-baseWhite'),
        icon: cn('text-baseWhite'),
      },
    },
    {
      variant: 'filled',
      color: 'error',
      pressed: true,
      class: {
        container: cn('bg-errorDarker'),
      },
    },

    // filled-warning
    {
      variant: 'filled',
      color: 'warning',
      pressed: true,
      class: {
        container: cn('bg-warningDarker'),
      },
    },
    {
      variant: 'filled',
      color: 'warning',
      class: {
        container: cn('bg-warningMain'),
        text: cn('text-baseWhite'),
        icon: cn('text-baseWhite'),
      },
    },
    {
      variant: 'filled',
      color: 'warning',
      pressed: true,
      class: {
        container: cn('bg-warningDarker'),
      },
    },

    // filled-disabled
    {
      variant: 'filled',
      disabled: true,
      class: {
        container: cn('bg-componentDisabled'),
        text: cn('text-textDisabled'),
        icon: cn('text-textDisabled'),
      },
    },

    /* outlined */

    // outlined-primary
    {
      variant: 'outlined',
      color: 'primary',
      class: {
        container: cn('border-primaryMain'),
        text: cn('text-primaryMain'),
        icon: cn('text-primaryMain'),
      },
    },
    {
      variant: 'outlined',
      color: 'primary',
      pressed: true,
      class: {
        container: cn('bg-componentPressed'),
      },
    },

    // outlined-secondary
    {
      variant: 'outlined',
      color: 'secondary',
      class: {
        container: cn('border-secondaryMain'),
        text: cn('text-secondaryMain'),
        icon: cn('text-secondaryMain'),
      },
    },
    {
      variant: 'outlined',
      color: 'secondary',
      pressed: true,
      class: {
        container: cn('bg-componentPressed'),
      },
    },

    // outlined-success
    {
      variant: 'outlined',
      color: 'success',
      class: {
        container: cn('border-successMain'),
        text: cn('text-successMain'),
        icon: cn('text-successMain'),
      },
    },
    {
      variant: 'outlined',
      color: 'success',
      pressed: true,
      class: {
        container: cn('bg-componentPressed'),
      },
    },

    // outlined-error
    {
      variant: 'outlined',
      color: 'error',
      class: {
        container: cn('border-errorMain'),
        text: cn('text-errorMain'),
        icon: cn('text-errorMain'),
      },
    },
    {
      variant: 'outlined',
      color: 'error',
      pressed: true,
      class: {
        container: cn('bg-componentPressed'),
      },
    },

    // outlined-warning
    {
      variant: 'outlined',
      color: 'warning',
      class: {
        container: cn('border-warningMain'),
        text: cn('text-warningMain'),
        icon: cn('text-warningMain'),
      },
    },
    {
      variant: 'outlined',
      color: 'warning',
      pressed: true,
      class: {
        container: cn('bg-componentPressed'),
      },
    },

    // outlined-disabled
    {
      variant: 'outlined',
      disabled: true,
      class: {
        container: cn('bg-componentDisabled border-componentDisabled'),
        text: cn('text-textDisabled border-componentDisabled'),
        icon: cn('text-textDisabled border-componentDisabled'),
      },
    },

    /* text */

    // text-primary
    {
      variant: 'text',
      color: 'primary',
      class: {
        text: cn('text-primaryMain'),
        icon: cn('text-primaryMain'),
      },
    },
    {
      variant: 'text',
      color: 'primary',
      pressed: true,
      class: {
        container: cn('bg-componentPressed'),
      },
    },

    // text-secondary
    {
      variant: 'text',
      color: 'secondary',
      class: {
        text: cn('text-secondaryMain'),
        icon: cn('text-secondaryMain'),
      },
    },
    {
      variant: 'text',
      color: 'secondary',
      pressed: true,
      class: {
        container: cn('bg-componentHovered'),
      },
    },

    // text-success
    {
      variant: 'text',
      color: 'success',
      class: {
        text: cn('text-successMain'),
        icon: cn('text-successMain'),
      },
    },
    {
      variant: 'text',
      color: 'success',
      pressed: true,
      class: {
        container: cn('bg-componentHovered'),
      },
    },

    // text-error
    {
      variant: 'text',
      color: 'error',
      class: {
        text: cn('text-errorMain'),
        icon: cn('text-errorMain'),
      },
    },
    {
      variant: 'text',
      color: 'error',
      pressed: true,
      class: {
        container: cn('bg-componentHovered'),
      },
    },

    // text-warning
    {
      variant: 'text',
      color: 'warning',
      class: {
        text: cn('text-warningMain'),
        icon: cn('text-warningMain'),
      },
    },
    {
      variant: 'text',
      color: 'warning',
      pressed: true,
      class: {
        container: cn('bg-componentHovered'),
      },
    },

    // text-warning
    {
      variant: 'text',
      color: 'text',
      class: {
        text: cn('text-textPrimary'),
        icon: cn('text-textPrimary'),
      },
    },
    {
      variant: 'text',
      color: 'text',
      pressed: true,
      class: {
        container: cn('bg-componentHovered'),
      },
    },

    // text-disabled
    {
      variant: 'text',
      disabled: true,
      class: {
        text: cn('text-textDisabled'),
        icon: cn('text-textDisabled'),
      },
    },
  ],

  defaultVariants: {
    variant: 'filled',
    size: 'large',
    color: 'primary',
  },
})

type Props = Omit<PressableProps, 'children'> & {
  title?: string
  leadingIconProps?: ComponentProps<typeof UiIcon>
  trailingIconProps?: ComponentProps<typeof UiIcon>

  children?: string | ReactElement | ReactNode
} & VariantProps<typeof buttonBaseTv>

// pressable forwards ref to view under the hood
type PressableRef = View

export const UiButton = forwardRef<PressableRef, Props>(
  (
    { title, size, variant, color, leadingIconProps, trailingIconProps, children, ...rest }: Props,
    ref,
  ) => {
    const [isPressed, setIsPressed] = useState(false)

    const baseStyles = useMemo(
      () => buttonBaseTv({ variant, size, pressed: isPressed, color, disabled: rest.disabled }),
      [color, isPressed, rest.disabled, size, variant],
    )

    const handleTouchStart = useCallback(
      (event: GestureResponderEvent) => {
        setIsPressed(true)
        rest?.onTouchStart?.(event)
      },
      [rest],
    )
    const handleTouchEnd = useCallback(
      (event: GestureResponderEvent) => {
        setIsPressed(false)
        rest?.onTouchEnd?.(event)
      },
      [rest],
    )

    const btnContent = useMemo(() => {
      if (children && typeof children !== 'string') {
        return children
      }

      return (
        (children || title) && <Text className={cn(baseStyles.text())}>{children || title}</Text>
      )
    }, [baseStyles, children, title])

    return (
      <Pressable {...rest} ref={ref} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <View className={cn(baseStyles.container())}>
          {leadingIconProps && <UiIcon {...leadingIconProps} className={cn(baseStyles.icon())} />}
          {btnContent}
          {trailingIconProps && <UiIcon {...trailingIconProps} className={cn(baseStyles.icon())} />}
        </View>
      </Pressable>
    )
  },
)
