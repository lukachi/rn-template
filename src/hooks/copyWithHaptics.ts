import * as Haptics from 'expo-haptics'

import { useCopyToClipboard } from '@/hooks/clipboard'

export const useCopyWithHaptics = () => {
  const { copy, ...rest } = useCopyToClipboard()

  const copyWithHaptics = async (value: string) => {
    copy(value)
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  return {
    ...rest,
    copy: copyWithHaptics,
  }
}
