/**
 * By default UiBottomSheet has a full height
 *
 * UiBottomSheet default example with content height
 *
 * <UiBottomSheet title='Authorization' ref={bottomSheet.ref} enableDynamicSizing={true}>
 *   <BottomSheetView style={{ paddingBottom: insets.bottom }}>
 *     <View className={cn('flex flex-col items-center gap-4 p-5 py-0')}>
 *       <UiHorizontalDivider />
 *
 *       <Text className='text-textSecondary typography-body2'>Choose a preferred method</Text>
 *
 *       <View className='mt-auto flex w-full flex-col gap-2'>
 *         <UiButton size='large' title='Create a new profile' />
 *         <UiButton size='large' title='Re-activate old profile' />
 *       </View>
 *     </View>
 *   </BottomSheetView>
 * </UiBottomSheet>
 */

import AntDesign from '@expo/vector-icons/AntDesign'
import type { BottomSheetBackdropProps, BottomSheetModalProps } from '@gorhom/bottom-sheet'
import { useBottomSheet } from '@gorhom/bottom-sheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import type { ReactNode } from 'react'
import { memo } from 'react'
import { useImperativeHandle } from 'react'
import { useMemo } from 'react'
import { forwardRef, useCallback, useRef } from 'react'
import type { ViewProps } from 'react-native'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { cn, useAppPaddings, useAppTheme } from '@/theme'

type UiBottomSheetProps = BottomSheetModalProps & {
  title?: string
  headerComponent?: ReactNode
  isCloseDisabled?: boolean
}

export const useUiBottomSheet = () => {
  const ref = useRef<BottomSheetModal>(null)

  const present = () => {
    ref.current?.present()
  }

  const dismiss = () => {
    ref.current?.dismiss()
  }

  return { ref, present, dismiss }
}

/**
 *
 * @param detached
 * @returns
 *
 * @description
 * In case the Bottom sheet is detached, we need to add some extra props to the Bottom sheet to make it look like a detached Bottom sheet.
 */

const useDetachedProps = () => {
  const insets = useSafeAreaInsets()

  return {
    detached: true,
    bottomInset: insets.bottom,
    style: { marginHorizontal: 20, overflow: 'hidden' },
  } as Partial<BottomSheetModalProps>
}

export const UiBottomSheet = forwardRef<BottomSheetModal, UiBottomSheetProps>(
  (
    {
      snapPoints: _snapPoints = ['100%'],
      title,
      detached = false,
      headerComponent,
      isCloseDisabled,
      children,
      ...rest
    },
    ref,
  ) => {
    const { palette } = useAppTheme()
    const insets = useSafeAreaInsets()

    const detachedProps = useDetachedProps()

    const uiBottomSheet = useUiBottomSheet()

    const snapPoints = useMemo(() => _snapPoints, [_snapPoints])

    useImperativeHandle(ref, () => (uiBottomSheet.ref.current as BottomSheetModal) || null)

    const renderHandleComponent = useCallback(
      () =>
        headerComponent || (
          <BottomSheetHeader
            title={title}
            dismiss={isCloseDisabled ? () => {} : uiBottomSheet.dismiss}
          />
        ),
      [headerComponent, isCloseDisabled, title, uiBottomSheet.dismiss],
    )

    return (
      <BottomSheetModal
        {...rest}
        {...(detached && detachedProps)}
        ref={uiBottomSheet.ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={rest.backdropComponent || renderBackdrop}
        handleComponent={renderHandleComponent}
        topInset={insets.top}
        children={children}
        enablePanDownToClose={!isCloseDisabled}
        backgroundStyle={{
          backgroundColor: palette.backgroundContainer,
          borderRadius: 20,
          ...(rest.backgroundStyle as object),
        }}
      />
    )
  },
)

/**
 * Custom Backdrop
 */

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const CustomBackdrop = ({ style }: BottomSheetBackdropProps) => {
  const { close } = useBottomSheet()
  return (
    <AnimatedPressable
      onPress={() => close()}
      entering={FadeIn.duration(50)}
      exiting={FadeOut.duration(20)}
      style={[style, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
    />
  )
}

export const renderBackdrop = (props: BottomSheetBackdropProps) => <CustomBackdrop {...props} />

/**
 * BottomSheetHeader
 */

type BottomSheetHeaderProps = {
  title?: string
  dismiss: () => void
} & ViewProps

export const BottomSheetHeader = memo(
  ({ title, dismiss, className, ...rest }: BottomSheetHeaderProps) => {
    const { palette } = useAppTheme()
    const appPaddings = useAppPaddings()

    return (
      <View
        {...rest}
        className={cn('flex-row items-center rounded-t-2xl py-6 pb-0', className)}
        style={[
          rest.style,
          {
            paddingLeft: appPaddings.left,
            paddingRight: appPaddings.right,
          },
        ]}
      >
        <View className='relative w-full'>
          {title && (
            <Text className='flex-1 text-[16px] font-bold text-textPrimary typography-h5'>
              {title}
            </Text>
          )}

          <Pressable
            onPress={dismiss}
            className='absolute right-0 top-1/2 size-[24px] -translate-y-1/2 items-center justify-center'
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            accessibilityLabel='close modal'
            accessibilityRole='button'
            accessibilityHint='closes the modal'
          >
            <AntDesign name='close' size={20} color={palette.textSecondary} />
          </Pressable>
        </View>
      </View>
    )
  },
)
