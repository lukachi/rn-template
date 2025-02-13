import debounce from 'lodash/debounce'
import { useEffect, useMemo, useRef } from 'react'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const useDebounce = <T extends (...params: any) => any>(callback: T, timeMs: number) => {
  const ref = useRef<T>(callback)

  useEffect(() => {
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    ref.current = callback
  }, [callback])

  const debouncedCallback = useMemo(() => {
    const func = () => {
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      ref.current?.()
    }

    return debounce(func, timeMs)

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [])

  return debouncedCallback as unknown as T
}
