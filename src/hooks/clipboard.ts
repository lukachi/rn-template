import * as Clipboard from 'expo-clipboard'
import { useCallback, useState } from 'react'

import { sleep } from '@/helpers'

export const useCopyToClipboard = (delay = 1000) => {
  const [isCopied, setIsCopied] = useState(false)

  const copy = useCallback(
    async (value: string) => {
      await Clipboard.setStringAsync(value)

      setIsCopied(true)
      await sleep(delay)
      setIsCopied(false)
    },
    [delay],
  )

  const fetchFromClipboard = useCallback(async () => {
    const text = await Clipboard.getStringAsync()
    return text
  }, [])

  return {
    isCopied,

    copy,
    fetchFromClipboard,
  }
}
