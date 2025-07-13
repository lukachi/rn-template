import { time } from '@distributedlab/tools'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import { type ComponentProps, useCallback, useMemo, useState } from 'react'
import type { ImageBackgroundProps, PressableProps, TextProps, ViewProps } from 'react-native'
import { StyleSheet } from 'react-native'
import { ImageBackground } from 'react-native'
import { Pressable } from 'react-native'
import { Text, View } from 'react-native'
import type { StyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet'
import type { ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheetTypes'
import { ScrollView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { DocumentCardUi } from '@/store'
import { uiPreferencesStore } from '@/store'
import { IdentityItem } from '@/store/modules/identity/Identity'
import { cn, useAppTheme } from '@/theme'
import { UiSwitcher } from '@/ui'
import { UiBottomSheet, useUiBottomSheet } from '@/ui'
import { UiHorizontalDivider, UiIcon } from '@/ui'
import { BottomSheetHeader } from '@/ui/UiBottomSheet'

type Props = {
  identity: IdentityItem
}

export default function DocumentCard({ identity }: Props) {
  const { palette } = useAppTheme()

  const [isCardLongPressed, setIsCardLongPressed] = useState(false)

  const {
    uiVariants,
    personalDetailsShownVariants,

    documentCardUi,

    setDocumentCardUi,
    togglePersonalDetailsVisibility,
    toggleIsBlurred,
  } = uiPreferencesStore.useDocumentCardUiPreference(
    identity.document.personDetails.documentNumber ?? '',
  )

  const cardUiSettingsBottomSheet = useUiBottomSheet()

  const insets = useSafeAreaInsets()

  const fullName = useMemo(() => {
    return `${identity.document.personDetails?.firstName} ${identity.document.personDetails?.lastName}`
  }, [identity.document.personDetails?.firstName, identity.document.personDetails?.lastName])

  const formattedBirthDate = useMemo(() => {
    if (!identity.document.personDetails?.birthDate) return time()

    return time(identity.document.personDetails?.birthDate, 'YYMMDD')
  }, [identity.document.personDetails?.birthDate])

  const age = useMemo(() => {
    if (!identity.document.personDetails?.birthDate) return 0

    return time().diff(formattedBirthDate, 'years')
  }, [formattedBirthDate, identity.document.personDetails?.birthDate])

  const Container = useCallback(
    ({
      docCardUI,
      ...containerRest
    }: { docCardUI: DocumentCardUi } & (ViewProps | ImageBackgroundProps)) => {
      if (get(docCardUI.background, 'source.uri')) {
        const imageBackgroundProps = docCardUI.background as ImageBackgroundProps

        return (
          <ImageBackground
            {...containerRest}
            {...imageBackgroundProps}
            style={StyleSheet.flatten([imageBackgroundProps.style, containerRest.style])}
          />
        )
      }

      const viewProps = docCardUI.background as ViewProps

      return (
        <View
          {...viewProps}
          {...containerRest}
          style={StyleSheet.flatten([viewProps.style, containerRest.style])}
        />
      )
    },
    [],
  )

  return (
    <>
      <Container className='relative overflow-hidden rounded-3xl p-6' docCardUI={documentCardUi}>
        <View className='flex flex-row'>
          <View className='flex gap-6'>
            <Image
              style={{ width: 56, height: 56, borderRadius: 9999 }}
              source={{
                uri: `data:image/png;base64,${identity.document.personDetails?.passportImageRaw}`,
              }}
            />

            <View className='flex gap-2'>
              <Text {...documentCardUi.foregroundValues} className='typography-h6'>
                {fullName}
              </Text>
              <Text {...documentCardUi.foregroundLabels} className='typography-body2'>
                {age} Years old
              </Text>
            </View>
          </View>
        </View>
        <UiHorizontalDivider className='mb-6 mt-8' />

        <View className='flex w-full gap-4'>
          {documentCardUi.personalDetailsShown?.map((el, idx) => {
            return (
              <DocumentCardRow
                key={idx}
                labelProps={{
                  ...documentCardUi.foregroundLabels,
                  children: el,
                }}
                valueProps={{
                  ...documentCardUi.foregroundValues,
                  children: identity.document.personDetails?.[el],
                }}
              />
            )
          })}
        </View>

        {documentCardUi.isBlurred && (
          <Pressable
            onLongPress={() => {
              setIsCardLongPressed(true)
            }}
            onPressOut={() => {
              setIsCardLongPressed(false)
            }}
            className={cn(
              'absolute bottom-0 left-0 right-0 top-0 z-10',
              isCardLongPressed && 'opacity-0',
            )}
          >
            <BlurView
              experimentalBlurMethod='dimezisBlurView'
              intensity={35}
              className='size-full'
            />
          </Pressable>
        )}

        <View className='absolute right-5 top-5 z-20 flex flex-row items-center gap-4'>
          <CardActionIconButton
            iconComponentNameProps={{ customIcon: 'passwordIcon' }}
            pressableProps={{
              onPress: toggleIsBlurred,
            }}
          />
          <CardActionIconButton
            iconComponentNameProps={{ customIcon: 'dotsThreeOutlineIcon' }}
            pressableProps={{
              onPress: () => {
                cardUiSettingsBottomSheet.present()
              },
            }}
          />
        </View>
      </Container>

      <UiBottomSheet
        ref={cardUiSettingsBottomSheet.ref}
        headerComponent={
          <BottomSheetHeader
            title='Settings'
            dismiss={cardUiSettingsBottomSheet.dismiss}
            className='px-5'
          />
        }
        backgroundStyle={{
          backgroundColor: palette.backgroundContainer,
        }}
        snapPoints={['50%']}
      >
        <UiHorizontalDivider />
        <BottomSheetScrollView style={{ paddingBottom: insets.bottom }}>
          <View className={cn('flex flex-col gap-4 p-5 pb-10')}>
            <View className={cn('flex flex-col gap-4')}>
              <Text className='typography-overline3 text-textSecondary'>CARD VISUAL</Text>

              <ScrollView horizontal={true}>
                <View className='flex flex-row gap-6'>
                  {uiVariants.map((el, idx) => {
                    const isActive = isEqual(documentCardUi, el)

                    return (
                      <Pressable key={idx} onPress={() => setDocumentCardUi(el)}>
                        <View
                          className={cn(
                            'items-center gap-2 rounded-lg border border-solid border-componentPrimary px-[24] py-[16]',
                            isActive && 'bg-componentPrimary',
                          )}
                        >
                          <Container
                            docCardUI={el}
                            style={{
                              width: 64,
                              height: 48,
                              borderRadius: 8,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 4,
                              ...el.background,
                            }}
                          >
                            <View
                              style={[
                                el.foregroundLabels.style as StyleProp<ViewStyle>,
                                {
                                  backgroundColor: get(
                                    el.foregroundLabels.style,
                                    'color',
                                    palette.baseWhite,
                                  ),
                                  width: 12,
                                  height: 12,
                                  borderRadius: 9999,
                                },
                              ]}
                            />
                            {[0, 0].map((_, index) => (
                              <View
                                key={index}
                                style={[
                                  {
                                    backgroundColor: get(
                                      el.foregroundValues.style,
                                      'color',
                                      palette.baseWhite,
                                    ),
                                    width: 24,
                                    height: 5,
                                    borderRadius: 12,
                                  },
                                  el.foregroundValues.style as StyleProp<ViewStyle>,
                                ]}
                              />
                            ))}
                          </Container>
                          <Text className='typography-buttonMedium text-textPrimary'>
                            {el.title}
                          </Text>
                        </View>
                      </Pressable>
                    )
                  })}
                </View>
              </ScrollView>
            </View>

            <UiHorizontalDivider />

            <View className={cn('flex flex-col gap-4')}>
              <View className={cn('flex flex-col gap-2')}>
                <Text className='typography-overline3 text-textSecondary'>DATA</Text>
                <Text className='typography-body4 text-textSecondary'>
                  Shows two identifiers on the card
                </Text>
              </View>

              <View className='flex flex-col gap-4'>
                {personalDetailsShownVariants.map((el, idx) => (
                  <View key={idx} className='flex flex-row items-center justify-between'>
                    <Text className='typography-subtitle4 text-textPrimary'>{el}</Text>
                    <UiSwitcher
                      value={documentCardUi.personalDetailsShown?.includes(el)}
                      onValueChange={() => togglePersonalDetailsVisibility(el)}
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </BottomSheetScrollView>
      </UiBottomSheet>
    </>
  )
}

function DocumentCardRow({
  labelProps,
  valueProps,

  className,
  ...rest
}: {
  labelProps: TextProps

  valueProps: TextProps
} & ViewProps) {
  return (
    <View {...rest} className={cn('flex w-full flex-row items-center justify-between', className)}>
      <Text {...labelProps} className={cn('typography-body3', labelProps.className)} />
      <Text {...valueProps} className={cn('typography-subtitle4', valueProps.className)} />
    </View>
  )
}

function CardActionIconButton({
  iconComponentNameProps,
  viewProps,
  pressableProps,
}: {
  iconComponentNameProps: ComponentProps<typeof UiIcon>
} & {
  viewProps?: ViewProps
  pressableProps?: PressableProps
}) {
  return (
    <Pressable {...pressableProps}>
      <View
        {...viewProps}
        className={cn(
          'flex size-[36] items-center justify-center rounded-full',
          viewProps?.className,
        )}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
        }}
      >
        <UiIcon
          {...iconComponentNameProps}
          className={cn('size-[18] text-baseWhite', iconComponentNameProps.className)}
        />
      </View>
    </Pressable>
  )
}
