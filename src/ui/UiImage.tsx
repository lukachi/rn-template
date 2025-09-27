import { styled } from 'nativewind'
import { Image, ImageProps } from 'react-native'

import { cn } from '@/theme'

styled(Image, {
  className: 'style',
})

export default function UiImage({ className, ...rest }: ImageProps) {
  return <Image {...rest} className={cn('size-full', className)} />
}
