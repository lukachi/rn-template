import AntDesign from '@expo/vector-icons/AntDesign'
import type { Icon, IconProps } from '@expo/vector-icons/build/createIconSet'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons'
import { cssInterop } from 'nativewind'
import type { SvgProps } from 'react-native-svg'

const CUSTOM_ICONS = {
  arrowCounterClockwiseIcon: require('@assets/icons/arrow-counter-clockwise-icon.svg').default,
  arrowDownIcon: require('@assets/icons/arrow-down-icon.svg').default,
  arrowLeftIcon: require('@assets/icons/arrow-left-icon.svg').default,
  arrowRightIcon: require('@assets/icons/arrow-right-icon.svg').default,
  arrowSquareOutIcon: require('@assets/icons/arrow-square-out-icon.svg').default,
  arrowUpIcon: require('@assets/icons/arrow-up-icon.svg').default,
  backspaceIcon: require('@assets/icons/backspace-icon.svg').default,
  bellFillIcon: require('@assets/icons/bell-fill-icon.svg').default,
  bellIcon: require('@assets/icons/bell-icon.svg').default,
  calendarBlankIcon: require('@assets/icons/calendar-blank-icon.svg').default,
  cardholderFillIcon: require('@assets/icons/cardholder-fill-icon.svg').default,
  cardholderIcon: require('@assets/icons/cardholder-icon.svg').default,
  caretLeftIcon: require('@assets/icons/caret-left-icon.svg').default,
  caretRightIcon: require('@assets/icons/caret-right-icon.svg').default,
  caretUpDownIcon: require('@assets/icons/caret-up-down-icon.svg').default,
  caretUpIcon: require('@assets/icons/caret-up-icon.svg').default,
  carretDownIcon: require('@assets/icons/carret-down-icon.svg').default,
  chartBarFillIcon: require('@assets/icons/chart-bar-fill-icon.svg').default,
  chartBarIcon: require('@assets/icons/chart-bar-icon.svg').default,
  chartLineIcon: require('@assets/icons/chart-line-icon.svg').default,
  checkIcon: require('@assets/icons/check-icon.svg').default,
  closeIcon: require('@assets/icons/close-icon.svg').default,
  copySimpleIcon: require('@assets/icons/copy-simple-icon.svg').default,
  discordIcon: require('@assets/icons/discord-icon.svg').default,
  dotsSixVerticalIcon: require('@assets/icons/dots-six-vertical-icon.svg').default,
  dotsThreeOutlineIcon: require('@assets/icons/dots-three-outline-icon.svg').default,
  facebookIcon: require('@assets/icons/facebook-icon.svg').default,
  fingerprintIcon: require('@assets/icons/fingerprint-icon.svg').default,
  flagIcon: require('@assets/icons/flag-icon.svg').default,
  giftFillIcon: require('@assets/icons/gift-fill-icon.svg').default,
  giftIcon: require('@assets/icons/gift-icon.svg').default,
  headsetIcon: require('@assets/icons/headset-icon.svg').default,
  historyIcon: require('@assets/icons/history-icon.svg').default,
  houseIcon: require('@assets/icons/house-icon.svg').default,
  houseSimpleFillIcon: require('@assets/icons/house-simple-fill-icon.svg').default,
  houseSimpleIcon: require('@assets/icons/house-simple-icon.svg').default,
  identificationCardFillIcon: require('@assets/icons/identification-card-fill-icon.svg').default,
  identificationCardIcon: require('@assets/icons/identification-card-icon.svg').default,
  imageIcon: require('@assets/icons/image-icon.svg').default,
  infiniteIcon: require('@assets/icons/infinite-icon.svg').default,
  infoIcon: require('@assets/icons/info-icon.svg').default,
  instagramIcon: require('@assets/icons/instagram-icon.svg').default,
  keyIcon: require('@assets/icons/key-icon.svg').default,
  linkIcon: require('@assets/icons/link-icon.svg').default,
  lockFillIcon: require('@assets/icons/lock-fill-icon.svg').default,
  lockIcon: require('@assets/icons/lock-icon.svg').default,
  logoutIcon: require('@assets/icons/logout-icon.svg').default,
  magnifyingGlassIcon: require('@assets/icons/magnifying-glass-icon.svg').default,
  mapPinIcon: require('@assets/icons/map-pin-icon.svg').default,
  metamaskIcon: require('@assets/icons/metamask-icon.svg').default,
  moonIcon: require('@assets/icons/moon-icon.svg').default,
  paletteIcon: require('@assets/icons/palette-icon.svg').default,
  passwordIcon: require('@assets/icons/password-icon.svg').default,
  pencilSimpleLineIcon: require('@assets/icons/pencil-simple-line-icon.svg').default,
  plusIcon: require('@assets/icons/plus-icon.svg').default,
  qrCodeIcon: require('@assets/icons/qr-code-icon.svg').default,
  questionFillIcon: require('@assets/icons/question-fill-icon.svg').default,
  questionIcon: require('@assets/icons/question-icon.svg').default,
  sealCheck1Icon: require('@assets/icons/seal-check-1-icon.svg').default,
  sealCheckIcon: require('@assets/icons/seal-check-icon.svg').default,
  share1Icon: require('@assets/icons/share-1-icon.svg').default,
  shareIcon: require('@assets/icons/share-icon.svg').default,
  shieldCheckIcon: require('@assets/icons/shield-check-icon.svg').default,
  slidersHorizontalIcon: require('@assets/icons/sliders-horizontal-icon.svg').default,
  stackSimpleFillIcon: require('@assets/icons/stack-simple-fill-icon.svg').default,
  stackSimpleIcon: require('@assets/icons/stack-simple-icon.svg').default,
  starFillIcon: require('@assets/icons/star-fill-icon.svg').default,
  starFourIcon: require('@assets/icons/star-four-icon.svg').default,
  starIcon: require('@assets/icons/star-icon.svg').default,
  suitcaseSimpleFillIcon: require('@assets/icons/suitcase-simple-fill-icon.svg').default,
  suitcaseSimpleIcon: require('@assets/icons/suitcase-simple-icon.svg').default,
  sunIcon: require('@assets/icons/sun-icon.svg').default,
  swapIcon: require('@assets/icons/swap-icon.svg').default,
  telegramIcon: require('@assets/icons/telegram-icon.svg').default,
  thumbsDownIcon: require('@assets/icons/thumbs-down-icon.svg').default,
  thumbsUpIcon: require('@assets/icons/thumbs-up-icon.svg').default,
  trashSimpleIcon: require('@assets/icons/trash-simple-icon.svg').default,
  trophyFillIcon: require('@assets/icons/trophy-fill-icon.svg').default,
  trophyIcon: require('@assets/icons/trophy-icon.svg').default,
  twitterIcon: require('@assets/icons/twitter-icon.svg').default,
  twitterXIcon: require('@assets/icons/twitter-x-icon.svg').default,
  userCircleIcon: require('@assets/icons/user-circle-icon.svg').default,
  userFocusIcon: require('@assets/icons/user-focus-icon.svg').default,
  userIcon: require('@assets/icons/user-icon.svg').default,
  userPlusIcon: require('@assets/icons/user-plus-icon.svg').default,
  usersIcon: require('@assets/icons/users-icon.svg').default,
  walletFilledIcon: require('@assets/icons/wallet-filled-icon.svg').default,
  walletIcon: require('@assets/icons/wallet-icon.svg').default,
  warningIcon: require('@assets/icons/warning-icon.svg').default,
  xCircleIcon: require('@assets/icons/x-circle-icon.svg').default,
}

const ICON_COMPONENTS = {
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome,
  SimpleLineIcons,
  Ionicons,
}

type LibIconsKeys = keyof typeof ICON_COMPONENTS

type CustomIconsKeys = keyof typeof CUSTOM_ICONS

type CommonProps = {
  color?: string
  size?: number
}

type CustomIconProps<C extends CustomIconsKeys> = Omit<SvgProps, 'color'> & {
  customIcon: C
  libIcon?: never
  name?: never
}

function CustomIcon<C extends CustomIconsKeys>({
  size,
  color,
  ...rest
}: CommonProps & CustomIconProps<C>) {
  const CustomComponent = CUSTOM_ICONS[rest.customIcon]

  return (
    <CustomComponent
      {...rest}
      style={[
        rest.style,
        {
          ...(color && { color }),
          minWidth: size,
          minHeight: size,
          width: size,
          height: size,
          maxWidth: size,
          maxHeight: size,
        },
      ]}
    />
  )
}

cssInterop(CustomIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      width: true,
      height: true,
      color: true,
    },
  },
})

type LibIconProps<L extends LibIconsKeys> = {
  libIcon: L
  name: keyof (typeof ICON_COMPONENTS)[L]['glyphMap']
  customIcon?: never
} & Omit<IconProps<string>, 'name' | 'color'>

function LibIcon<L extends LibIconsKeys>({
  size,
  color,

  libIcon,
  name,

  ...rest
}: CommonProps & LibIconProps<L>) {
  const IconComponent = ICON_COMPONENTS[libIcon] as Icon<string, string>

  return <IconComponent {...rest} name={name as string} size={size} color={color} />
}

cssInterop(LibIcon, {
  className: {
    target: 'style',
  },
})

type Props<T extends CustomIconsKeys | LibIconsKeys> = T extends CustomIconsKeys
  ? CustomIconProps<T>
  : T extends LibIconsKeys
    ? LibIconProps<T>
    : undefined

function UiIcon<T extends CustomIconsKeys | LibIconsKeys>(props: Props<T> & CommonProps) {
  if ('libIcon' in props) {
    return <LibIcon {...(props as LibIconProps<LibIconsKeys>)} />
  }

  return <CustomIcon {...(props as CustomIconProps<CustomIconsKeys>)} />
}

export default UiIcon
