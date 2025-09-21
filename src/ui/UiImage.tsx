import type { ImageProps } from 'expo-image'
import { Image as NImage } from 'expo-image'
import { cssInterop } from 'nativewind'

import { cn } from '@/theme'

cssInterop(NImage, {
  className: 'style',
})

export default function UiImage({ className, ...rest }: ImageProps) {
  return <NImage {...rest} className={cn('size-full', className)} />
}
