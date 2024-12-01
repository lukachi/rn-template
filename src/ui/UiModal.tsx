import type { ModalProps } from 'react-native'
import { Pressable } from 'react-native'
import { Modal, View } from 'react-native'

type Props = {
  isCloseByClickOutside?: boolean
} & ModalProps

export default function UiModal({ children, isCloseByClickOutside = true, ...rest }: Props) {
  return (
    <View className='flex flex-1 items-center justify-center'>
      <Modal animationType='fade' transparent={true} {...rest}>
        <Pressable
          className='h-full w-full'
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onPress={isCloseByClickOutside ? rest.onRequestClose : undefined}
        />
        <View className='absolute left-1/2 top-1/2 flex flex-1 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-modal'>
          {children}
        </View>
      </Modal>
    </View>
  )
}
