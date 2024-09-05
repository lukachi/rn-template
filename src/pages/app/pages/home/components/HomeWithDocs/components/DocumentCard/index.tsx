import { time } from '@distributedlab/tools'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Image } from 'expo-image'
import isEqual from 'lodash/isEqual'
import { useMemo } from 'react'
import type { PressableProps, ViewProps } from 'react-native'
import { ScrollView } from 'react-native'
import { Pressable } from 'react-native'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { IdentityItem } from '@/store'
import { uiPreferencesStore } from '@/store'
import { cn, useAppTheme } from '@/theme'
import type { UiIconName } from '@/ui'
import { UiSwitcher } from '@/ui'
import { UiBottomSheet, useUiBottomSheet } from '@/ui'
import { UiHorizontalDivider, UiIcon } from '@/ui'
import { BottomSheetHeader } from '@/ui/UiBottomSheet'

type Props = {
  identity: IdentityItem
}

export default function DocumentCard({ identity }: Props) {
  const { palette } = useAppTheme()

  const { uiVariants, documentCardUi, setDocumentCardUi } =
    uiPreferencesStore.useDocumentCardUiPreference(
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

  return (
    <>
      <View
        className={'rounded-3xl p-6'}
        style={{
          backgroundColor: documentCardUi.background,
        }}
      >
        <View className={'relative flex flex-row'}>
          <View className={'flex gap-6'}>
            <Image
              style={{ width: 56, height: 56, borderRadius: 1000 }}
              source={{
                uri: `data:image/png;base64,${identity.document.personDetails?.passportImageRaw}`,
              }}
            />

            <View className={'flex gap-2'}>
              <Text
                style={{
                  color: documentCardUi.foregroundValues,
                }}
                className={'typography-h6'}
              >
                {fullName}
              </Text>
              <Text
                style={{
                  color: documentCardUi.foregroundLabels,
                }}
                className={'typography-body2'}
              >
                {age} Years old
              </Text>
            </View>
          </View>

          <View className={'absolute right-0 top-0 flex flex-row items-center gap-4'}>
            <CardActionIconButton iconComponentName={'passwordIcon'} />
            <CardActionIconButton
              iconComponentName={'dotsThreeOutlineIcon'}
              pressableProps={{
                onPress: () => {
                  cardUiSettingsBottomSheet.present()
                },
              }}
            />
          </View>
        </View>
        <UiHorizontalDivider className={'mb-6 mt-8'} />

        <View className={'flex w-full gap-4'}>
          {identity.document.personDetails?.nationality && (
            <DocumentCardRow
              label={'Nationality'}
              labelColor={documentCardUi.foregroundLabels}
              value={identity.document.personDetails?.nationality}
              valueColor={documentCardUi.foregroundValues}
            />
          )}
          {identity.document.personDetails?.documentNumber && (
            <DocumentCardRow
              labelColor={documentCardUi.foregroundLabels}
              label={'Document Number'}
              valueColor={documentCardUi.foregroundValues}
              value={identity.document.personDetails?.documentNumber}
            />
          )}
        </View>
      </View>

      <UiBottomSheet
        ref={cardUiSettingsBottomSheet.ref}
        headerComponent={
          <BottomSheetHeader
            title={'Settings'}
            dismiss={cardUiSettingsBottomSheet.dismiss}
            className={'px-5'}
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
              <Text className={'text-textSecondary typography-overline3'}>CARD VISUAL</Text>

              <ScrollView horizontal={true}>
                <View className={'flex flex-row gap-6'}>
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
                          <View
                            style={{
                              backgroundColor: el.background,
                              width: 64,
                              height: 48,
                              borderRadius: 8,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: el.foregroundLabels,
                                width: 12,
                                height: 12,
                                borderRadius: 9999,
                              }}
                            />
                            {[0, 0].map((_, index) => (
                              <View
                                key={index}
                                style={{
                                  backgroundColor: el.foregroundLabels,
                                  width: 24,
                                  height: 5,
                                  borderRadius: 12,
                                }}
                              />
                            ))}
                          </View>
                          <Text className={'text-textPrimary typography-buttonMedium'}>Front</Text>
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
                <Text className={'text-textSecondary typography-overline3'}>DATA</Text>
                <Text className={'text-textSecondary typography-body4'}>
                  Shows two identifiers on the card
                </Text>
              </View>

              <View className={'flex flex-col gap-4'}>
                {[0, 1, 0, 1, 0].map((el, idx) => (
                  <View key={idx} className={'flex flex-row items-center justify-between'}>
                    <Text className={'text-textPrimary typography-subtitle4'}>Nationality</Text>
                    <UiSwitcher className={'relative'} value={!!el} />
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
  label,
  labelColor,

  value,
  valueColor,

  className,
  ...rest
}: {
  label: string
  labelColor: string

  value: string
  valueColor: string
} & ViewProps) {
  return (
    <View {...rest} className={cn('flex w-full flex-row items-center justify-between', className)}>
      <Text
        style={{
          color: labelColor,
        }}
        className={'typography-body3'}
      >
        {label}
      </Text>
      <Text
        style={{
          color: valueColor,
        }}
        className={'typography-subtitle4'}
      >
        {value}
      </Text>
    </View>
  )
}

function CardActionIconButton({
  iconComponentName,
  viewProps,
  pressableProps,
}: {
  iconComponentName: UiIconName
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
        <UiIcon componentName={iconComponentName} className={'size-[18] text-baseWhite'} />
      </View>
    </Pressable>
  )
}
