import type { ImageProps } from 'expo-image'
import { Image } from 'expo-image'
import { cssInterop } from 'nativewind'

function UiImage(props: ImageProps) {
  return <Image {...props} />
}

cssInterop(UiImage, {
  className: 'style',
})

export default UiImage
