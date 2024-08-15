import { useReactQueryDevTools } from '@dev-plugins/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import type { PropsWithChildren } from 'react'

import { Config } from '@/config'
import { authStore } from '@/store'

const getAccessToken = () => authStore.useAuthStore.getState().accessToken
const refreshAuthTokens = authStore.useAuthStore.getState().refresh
const logout = authStore.useAuthStore.getState().logout

export const apiClient = axios.create({
  baseURL: Config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  async config => {
    const accessToken = getAccessToken()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  error => {
    Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  response => response, // Directly return successful responses.
  async error => {
    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // Mark the request as retried to avoid infinite loops.

      try {
        const newAacessToken = await refreshAuthTokens()

        // Update the authorization header with the new access token.
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAacessToken}`

        return apiClient(originalRequest) // Retry the original request with the new access token.
      } catch (refreshError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        console.error('Token refresh failed:', refreshError)

        logout()

        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error) // For all other errors, return the error as is.
  },
)

export const queryClient = new QueryClient()

export function APIProvider({ children }: PropsWithChildren) {
  useReactQueryDevTools(queryClient)
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
