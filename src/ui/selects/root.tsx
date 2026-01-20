import { Select as HNSelect, useSelectAnimation } from 'heroui-native'
import { ChevronDownIcon } from 'lucide-react-native'
import { ComponentProps } from 'react'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { cn } from '@/theme/utils'

import { UiLucideIcon } from '../icons/UiLucideIcon'

const Select = HNSelect

const SelectTrigger = HNSelect.Trigger

const SelectValue = HNSelect.Value

const SelectPortal = HNSelect.Portal

const SelectOverlay = HNSelect.Overlay

const SelectContent = HNSelect.Content

const SelectItem = HNSelect.Item

const SelectItemLabel = HNSelect.ItemLabel

const SelectItemDescription = HNSelect.ItemDescription

const SelectItemIndicator = HNSelect.ItemIndicator

const SelectListLabel = HNSelect.ListLabel

const SelectClose = HNSelect.Close

const AnimatedTrigger = ({
  containerProps,
  valueProps,
}: {
  containerProps?: ComponentProps<typeof SelectTrigger>
  valueProps?: ComponentProps<typeof SelectValue>
}) => {
  const { progress } = useSelectAnimation()

  const rContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1, 2], [0, 1, 0])
    return {
      opacity,
    }
  })

  const rChevronStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1, 2], [0, -180, 0])
    return {
      transform: [{ rotate: `${rotate}deg` }],
    }
  })

  return (
    <SelectTrigger
      {...containerProps}
      className={cn(
        'bg-field border-field-border justify-center rounded-(--radius) border px-4 py-2 shadow-md shadow-black/5',
        containerProps?.className,
      )}
    >
      <Animated.View
        style={rContainerStyle}
        className={cn(
          'border-accent pointer-events-none absolute -inset-0.5 rounded-(--radius) border-[2.5px]',
        )}
      />
      <SelectValue {...valueProps} placeholder={valueProps?.placeholder ?? 'Select'} />
      <Animated.View style={rChevronStyle} className='absolute right-3'>
        <UiLucideIcon as={ChevronDownIcon} size={18} className='text-muted' />
      </Animated.View>
    </SelectTrigger>
  )
}

export {
  AnimatedTrigger as UiAnimatedTrigger,
  Select as UiSelect,
  SelectClose as UiSelectClose,
  SelectContent as UiSelectContent,
  SelectItem as UiSelectItem,
  SelectItemDescription as UiSelectItemDescription,
  SelectItemIndicator as UiSelectItemIndicator,
  SelectItemLabel as UiSelectItemLabel,
  SelectListLabel as UiSelectListLabel,
  SelectOverlay as UiSelectOverlay,
  SelectPortal as UiSelectPortal,
  SelectTrigger as UiSelectTrigger,
  SelectValue as UiSelectValue,
}
