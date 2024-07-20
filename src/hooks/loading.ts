import _isEmpty from 'lodash/isEmpty'
import { useEffect, useMemo, useState } from 'react'

import { ErrorHandler } from '@/core'

type LoadingControl<T> = {
  data: T
  isLoading: boolean
  isLoadingError: boolean
  reload: () => Promise<void>
  isEmpty: boolean
  update: () => Promise<void>
  reset: () => void
}

export const useLoading = <T>(
  initialState: T,
  loadFn: () => Promise<T>,
  options?: {
    loadArgs?: any[] | null
    loadOnMount?: boolean
    // in case if we need to paginate through all pages and concat in to one array
    loadAllPages?: boolean
  },
): LoadingControl<T> => {
  const { loadArgs, loadOnMount: _loadOnMount } = options ?? {}
  const loadOnMount = useMemo(() => _loadOnMount ?? true, [_loadOnMount])
  const [isLoading, setIsLoading] = useState(loadOnMount)
  const [isLoadingError, setIsLoadingError] = useState(false)
  const [data, setData] = useState(initialState as T)

  const isEmpty = useMemo(() => {
    if (!data) return true
    return _isEmpty(data)
  }, [data])

  const load = async () => {
    setIsLoading(true)
    setIsLoadingError(false)
    setData(initialState as T)
    try {
      setData(await loadFn())
    } catch (e) {
      setIsLoadingError(true)
      ErrorHandler.process(e)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (loadOnMount) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, loadArgs ?? [])

  const reload = async () => {
    await load()
  }
  const update = async () => {
    setIsLoadingError(false)
    try {
      setData(await loadFn())
    } catch (e) {
      setIsLoadingError(true)
      ErrorHandler.process(e)
    }
  }

  const reset = () => {
    setIsLoading(false)
    setIsLoadingError(false)
    setData(initialState as T)
  }

  return { data, isLoading, isLoadingError, isEmpty, reload, update, reset }
}

// TODO: add multi page loading
