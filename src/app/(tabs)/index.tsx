import { ExternalLink } from '@tamagui/lucide-icons'
import { ToastControl } from 'src/app/CurrentToast'
import { Anchor, H2, Paragraph, XStack, YStack, Text, ScrollView } from 'tamagui'

import LangSwitcher from '@/app/LangSwitcher'
import { formatDateDiff, formatDateDMY, formatDateDMYT } from '@/helpers'
import { translate } from '@/core'

export default function TabOneScreen() {
  return (
    <ScrollView>
      <YStack f={1} ai='center' gap='$8' px='$10' pt='$5'>
        <H2 textAlign={'center'}>Tamagui + Expo</H2>

        <LangSwitcher />

        <Text>{formatDateDMY(1720949121)}</Text>
        <Text>{formatDateDMYT(1720949121)}</Text>
        <Text>{formatDateDiff(1720949121)}</Text>

        <Text>Plurals</Text>

        <Text>{translate('plurals.key', { count: 1 })}</Text>
        <Text>{translate('plurals.key', { count: 2 })}</Text>
        <Text>{translate('plurals.key', { count: 3 })}</Text>
        <Text>{translate('plurals.key', { count: 4 })}</Text>
        <Text>{translate('plurals.key', { count: 5 })}</Text>
        <Text>{translate('plurals.key', { count: 25 })}</Text>
        <Text>{translate('plurals.key', { count: 205 })}</Text>

        <ToastControl />

        <XStack ai='center' jc='center' fw='wrap' gap='$1.5' pos='absolute' b='$8'>
          <Paragraph fos='$5'>Add</Paragraph>

          <Paragraph fos='$5' px='$2' py='$1' col='$blue10' bg='$blue5' br='$3'>
            tamagui.config.ts
          </Paragraph>

          <Paragraph fos='$5'>to root and follow the</Paragraph>

          <XStack
            ai='center'
            gap='$1.5'
            px='$2'
            py='$1'
            br='$3'
            bg='$purple5'
            hoverStyle={{ bg: '$purple6' }}
            pressStyle={{ bg: '$purple4' }}
          >
            <Anchor
              href='https://tamagui.dev/docs/core/configuration'
              textDecorationLine='none'
              col='$purple10'
              fos='$5'
            >
              Configuration guide
            </Anchor>
            <ExternalLink size='$1' col='$purple10' />
          </XStack>

          <Paragraph fos='$5' ta='center'>
            to configure your themes and tokens.
          </Paragraph>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
