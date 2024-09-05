import { time } from '@distributedlab/tools'
import { Image } from 'expo-image'
import { useMemo } from 'react'
import type { ViewProps } from 'react-native'
import { Text, View } from 'react-native'

import type { IdentityItem } from '@/store'
import { cn } from '@/theme'
import { UiCard, UiHorizontalDivider } from '@/ui'

type Props = {
  identity: IdentityItem
}

export default function DocumentCard({ identity }: Props) {
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
    <UiCard>
      <View className={'flex gap-6'}>
        <Image
          style={{ width: 56, height: 56, borderRadius: 1000 }}
          source={{
            uri: `data:image/png;base64,${identity.document.personDetails?.passportImageRaw}`,
          }}
        />

        <View className={'flex gap-2'}>
          <Text className={'text-textPrimary typography-h6'}>{fullName}</Text>
          <Text className={'text-textPrimary typography-body2'}>{age} Years old</Text>
        </View>
      </View>

      <UiHorizontalDivider className={'mb-6 mt-8'} />

      <View className={'flex w-full gap-4'}>
        {identity.document.personDetails?.nationality && (
          <DocumentCardRow
            label={'Nationality'}
            value={identity.document.personDetails?.nationality}
          />
        )}
        {identity.document.personDetails?.documentNumber && (
          <DocumentCardRow
            label={'Document Number'}
            value={identity.document.personDetails?.documentNumber}
          />
        )}
      </View>
    </UiCard>
  )
}

function DocumentCardRow({
  label,
  value,
  className,
  ...rest
}: { label: string; value: string } & ViewProps) {
  return (
    <View {...rest} className={cn('flex w-full flex-row items-center justify-between', className)}>
      <Text className={'text-textPrimary typography-body3'}>{label}</Text>
      <Text className={'text-textPrimary typography-subtitle4'}>{value}</Text>
    </View>
  )
}
