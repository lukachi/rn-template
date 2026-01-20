import * as Slot from '@rn-primitives/slot'
import { usePopover } from 'heroui-native'
import { type ComponentProps, createContext, ReactNode, useContext } from 'react'
import { View } from 'react-native'
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils'

import { cn } from '@/theme/utils'
import { UiButton } from '@/ui/UiButton'

import {
  UiPopover,
  UiPopoverContent,
  UiPopoverOverlay,
  UiPopoverPortal,
  UiPopoverTrigger,
} from './UiPopover'
import { UiSpinner } from './UISpinner'

/**
 * @example
 *
 * <UiSubmittingButton>
    <UiSubmittingButtonTrigger asChild>
      <UiButton
        onPress={e => {
          e.preventDefault()
        }}
      >
        Show
      </UiButton>
    </UiSubmittingButtonTrigger>

    <UiSubmittingButtonContent>
      <UiSubmittingButtonContentBody>
        <UiSubmittingButtonConfirm
          onPress={() => {
            emitter.emit('success', {
              message: 'Accepted',
            })
          }}
        />
        <UiSubmittingButtonCancel
          onPress={() => {
            emitter.emit('error', {
              message: 'Denied',
            })
          }}
        />
      </UiSubmittingButtonContentBody>
    </UiSubmittingButtonContent>
  </UiSubmittingButton>
 */

type UiSubmittingButtonContextValue = {
  isSubmitting?: boolean
  disabled?: boolean
}

const UiSubmittingButtonContext = createContext<UiSubmittingButtonContextValue | null>(null)

function useUiSubmittingButtonContext() {
  const context = useContext(UiSubmittingButtonContext)
  if (!context) {
    throw new Error('UiSubmittingButton compound components must be used within UiSubmittingButton')
  }
  return context
}

function UiSubmittingButton({
  children,

  isSubmitting,
  disabled,

  ...rest
}: {
  isSubmitting?: boolean
  disabled?: boolean
} & ComponentProps<typeof UiPopover>) {
  return (
    <UiSubmittingButtonContext.Provider value={{ isSubmitting, disabled }}>
      <UiPopover {...rest}>{children}</UiPopover>
    </UiSubmittingButtonContext.Provider>
  )
}

function UiSubmittingButtonTrigger({
  isDisabled,
  ...props
}: ComponentProps<typeof UiPopoverTrigger>) {
  const context = useUiSubmittingButtonContext()

  return (
    <UiPopoverTrigger
      {...props}
      isDisabled={context.isSubmitting || isDisabled || context.disabled}
    />
  )
}

function UiSubmittingButtonIndicator() {
  const context = useUiSubmittingButtonContext()

  return <>{context.isSubmitting && <UiSpinner />}</>
}

function UiSubmittingButtonContent(
  props: Omit<ComponentProps<typeof UiPopoverContent>, 'presentation'>,
) {
  return (
    <UiPopoverPortal>
      <UiPopoverOverlay className='bg-background/80' />
      {/* FIXME */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <UiPopoverContent presentation='bottom-sheet' {...props} />
    </UiPopoverPortal>
  )
}

function UiSubmittingButtonContentBody(props: ViewProps) {
  return <View {...props} className={cn('flex gap-4', props.className)} />
}

type UiSubmittingButtonCancelProps =
  | ({ asChild?: false; children?: ReactNode } & ComponentProps<typeof UiButton>)
  | ({ asChild: true; children?: ReactNode } & ComponentProps<typeof Slot.Pressable>)

function UiSubmittingButtonCancel(allProps: UiSubmittingButtonCancelProps) {
  const { asChild = false, children = 'Cancel', className, ...restProps } = allProps

  const { onOpenChange } = usePopover()

  if (asChild) {
    const { onPress, ...props } = restProps as ComponentProps<typeof Slot.Pressable>
    return (
      <Slot.Pressable
        className={className ?? 'flex-1'}
        onPress={e => {
          if (onPress && typeof onPress === 'function') {
            onPress(e)
          }
          onOpenChange(false)
        }}
        {...props}
      >
        {children}
      </Slot.Pressable>
    )
  }

  const { onPress, ...props } = restProps as ComponentProps<typeof UiButton>
  return (
    <UiButton
      className={className ?? 'flex-1'}
      variant='danger-soft'
      onPress={e => {
        if (onPress && typeof onPress === 'function') {
          onPress(e)
        }
        onOpenChange(false)
      }}
      {...props}
    >
      {children}
    </UiButton>
  )
}

type UiSubmittingButtonConfirmProps =
  | ({ asChild?: false; children?: ReactNode } & ComponentProps<typeof UiButton>)
  | ({ asChild: true; children?: ReactNode } & ComponentProps<typeof Slot.Pressable>)

function UiSubmittingButtonConfirm(allProps: UiSubmittingButtonConfirmProps) {
  const { asChild = false, children = 'Confirm', className, ...restProps } = allProps
  const { onOpenChange } = usePopover()

  if (asChild) {
    const { onPress, ...props } = restProps as ComponentProps<typeof Slot.Pressable>
    return (
      <Slot.Pressable
        className={className ?? 'flex-1'}
        onPress={e => {
          if (onPress && typeof onPress === 'function') {
            onPress(e)
          }
          onOpenChange(false)
        }}
        {...props}
      >
        {children}
      </Slot.Pressable>
    )
  }

  const { onPress, ...props } = restProps as ComponentProps<typeof UiButton>
  return (
    <UiButton
      className={className ?? 'flex-1'}
      onPress={e => {
        if (onPress && typeof onPress === 'function') {
          onPress(e)
        }
        onOpenChange(false)
      }}
      {...props}
    >
      {children}
    </UiButton>
  )
}

export {
  UiSubmittingButton,
  UiSubmittingButtonCancel,
  UiSubmittingButtonConfirm,
  UiSubmittingButtonContent,
  UiSubmittingButtonContentBody,
  UiSubmittingButtonIndicator,
  UiSubmittingButtonTrigger,
}
