import { useReactQueryDevTools } from '@dev-plugins/react-query'
// import { JsonApiClient } from '@distributedlab/jac'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

// import { Config } from '@/config'
// import { sleep } from '@/helpers'
// import { authStore } from '@/store'

// import { attachBearerInjector, attachUnAuthorizedErrorHandler } from './api-nterceptors'

// export const getApiClient = () => {
//   const logout = authStore.useAuthStore.getState().logout
//   const refresh = authStore.useAuthStore.getState().refresh
//
//   const getAccessToken = () => authStore.useAuthStore.getState().accessToken
//
//   return new JsonApiClient({ baseUrl: Config.API_URL }, [
//     {
//       request: attachBearerInjector(getAccessToken()),
//       error: attachUnAuthorizedErrorHandler(
//         async () => {
//           let getIsRefreshing = () => authStore.useAuthStore.getState().isRefreshing
//
//           if (getIsRefreshing()) {
//             do {
//               await sleep(200)
//             } while (getIsRefreshing())
//           } else {
//             await refresh()
//           }
//
//           await sleep(200)
//
//           return getAccessToken()
//         },
//         async () => {
//           logout()
//         },
//       ),
//     },
//   ])
// }

export const queryClient = new QueryClient()

export function APIProvider({ children }: PropsWithChildren) {
  useReactQueryDevTools(queryClient)
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
