import { Image, ImageProps } from 'react-native'
import { withUniwind } from 'uniwind'

import { cn } from '@/theme/utils'

const StyledImage = withUniwind(Image)

export default function UiImage({ className, ...rest }: ImageProps) {
  return <StyledImage {...rest} className={cn('size-full', className)} />
}
