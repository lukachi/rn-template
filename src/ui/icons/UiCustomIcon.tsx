import { type SvgProps } from 'react-native-svg'
import { withUniwind } from 'uniwind'

const CUSTOM_ICONS = {
  xCircleIcon: require('@assets/icons/x-circle-icon.svg').default,
}

type CustomIconProps = SvgProps & {
  name: keyof typeof CUSTOM_ICONS
}

function CustomIcon(props: CustomIconProps) {
  const CustomComponent = CUSTOM_ICONS[props.name]

  return <CustomComponent {...props} />
}

const StyledCustomIcon = withUniwind(CustomIcon)

export default function UiCustomIcon(props: CustomIconProps) {
  return <StyledCustomIcon {...props} />
}
