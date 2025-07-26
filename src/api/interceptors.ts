import Jsona from 'jsona'

import { apiClient } from '@/api/client'
import { authStore } from '@/store'

const getAccessToken = () => authStore.useAuthStore.getState().accessToken
const refreshAuthTokens = authStore.useAuthStore.getState().refresh
const logout = authStore.useAuthStore.getState().logout

export const initInterceptors = () => {
  const dataFormatter = new Jsona()
  apiClient.interceptors.response.use(response => {
    try {
      const isArray = Array.isArray(response.data.data)

      // TODO: verify with real jsonapi serializer
      if (isArray) {
        return {
          ...response,
          data: {
            ...response.data,
            data: dataFormatter.deserialize(response.data),
          },
        }
      }

      const deserializedData = dataFormatter.deserialize(response.data)

      if (!deserializedData) return response

      return {
        ...response,
        data: deserializedData,
      }
    } catch (error) {
      console.error('Could not deserialize data', error)
      return response
    }
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

      const accessToken = getAccessToken()

      if (error.response.status === 401 && !originalRequest._retry && accessToken) {
        originalRequest._retry = true // Mark the request as retried to avoid infinite loops.

        try {
          const newAccessToken = await refreshAuthTokens()

          // Update the authorization header with the new access token.
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`

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
}
