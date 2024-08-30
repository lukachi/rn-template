import { useReactQueryDevTools } from '@dev-plugins/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import type { PropsWithChildren } from 'react'

import { Config } from '@/config'

export const apiClient = axios.create({
  baseURL: Config.RELAYER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const queryClient = new QueryClient()

export function APIProvider({ children }: PropsWithChildren) {
  useReactQueryDevTools(queryClient)
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
