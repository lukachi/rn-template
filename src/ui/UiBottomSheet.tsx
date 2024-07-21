import AntDesign from '@expo/vector-icons/AntDesign'
import type { BottomSheetBackdropProps, BottomSheetModalProps } from '@gorhom/bottom-sheet'
import { useBottomSheet } from '@gorhom/bottom-sheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import type { ForwardedRef } from 'react'
import { memo } from 'react'
import { useImperativeHandle } from 'react'
import { useMemo } from 'react'
import { forwardRef, useCallback, useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { useAppTheme } from '@/theme'

type UiBottomSheetProps = BottomSheetModalProps & {
  title?: string
}

export const useUiBottomSheet = () => {
  const ref = useRef<BottomSheetModal>(null)

  const present = useCallback(() => {
    ref.current?.present()
  }, [])

  const dismiss = useCallback(() => {
    ref.current?.dismiss()
  }, [])

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

const getDetachedProps = (detached: boolean) => {
  if (detached) {
    return {
      detached: true,
      bottomInset: 46,
      style: { marginHorizontal: 16, overflow: 'hidden' },
    } as Partial<BottomSheetModalProps>
  }
  return {} as Partial<BottomSheetModalProps>
}

export const UiBottomSheet = forwardRef(
  (
    { snapPoints: _snapPoints = ['60%'], title, detached = false, ...rest }: UiBottomSheetProps,
    ref: ForwardedRef<BottomSheetModal>,
  ) => {
    const detachedProps = useMemo(() => getDetachedProps(detached), [detached])

    const uiBottomSheet = useUiBottomSheet()

    const snapPoints = useMemo(() => _snapPoints, [_snapPoints])

    useImperativeHandle(ref, () => (uiBottomSheet.ref.current as BottomSheetModal) || null)

    const renderHandleComponent = useCallback(
      () => (
        <>
          {/*<View className='mb-8 mt-2 h-1 w-12 self-center rounded-lg bg-gray-400 dark:bg-gray-700' />*/}
          <BottomSheetHeader title={title} dismiss={uiBottomSheet.dismiss} />
        </>
      ),
      [title, uiBottomSheet.dismiss],
    )

    return (
      <BottomSheetModal
        {...rest}
        {...detachedProps}
        ref={uiBottomSheet.ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={rest.backdropComponent || renderBackdrop}
        handleComponent={renderHandleComponent}
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
}

const BottomSheetHeader = memo(({ title, dismiss }: BottomSheetHeaderProps) => {
  const { palette } = useAppTheme()

  return (
    <>
      {title && (
        <View className='flex-row px-2 py-4'>
          <View className='flex-1'>
            <Text className='text-center text-[16px] font-bold text-textPrimary'>{title}</Text>
          </View>
        </View>
      )}

      <Pressable
        onPress={dismiss}
        className='absolute right-3 top-3 size-[24px] items-center justify-center'
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        accessibilityLabel='close modal'
        accessibilityRole='button'
        accessibilityHint='closes the modal'
      >
        <AntDesign name='close' size={20} color={palette.textSecondary} />
      </Pressable>
    </>
  )
})
