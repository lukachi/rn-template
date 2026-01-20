import type { LucideIcon, LucideProps } from 'lucide-react-native'
import { useResolveClassNames, withUniwind } from 'uniwind'

import { cn } from '@/theme/utils'

type IconProps = LucideProps & {
  as: LucideIcon
}

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />
}

const StyledIconImpl = withUniwind(IconImpl, {
  size: {
    fromClassName: 'sizeClassName',
  },
})

function Icon({ as: IconComponent, className, ...props }: IconProps) {
  const styles = useResolveClassNames(cn(className))

  return <StyledIconImpl as={IconComponent} style={styles} {...props} />
}

export { Icon as UiLucideIcon }
