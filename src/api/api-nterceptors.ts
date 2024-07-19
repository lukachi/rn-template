// import type { FetcherRequest, FetcherResponse, HTTP_METHODS } from '@distributedlab/fetcher'
// import { Fetcher } from '@distributedlab/fetcher'
// import type { JsonApiResponseErrors } from '@distributedlab/jac'
// import { HTTP_STATUS_CODES } from '@distributedlab/jac'

// export const attachBearerInjector = (accessToken?: string) => async (request: FetcherRequest) => {
//   if (!accessToken) return request
//
//   if (!request.headers) request.headers = {}
//
//   request.headers = {
//     ...request.headers,
//     Authorization: `Bearer ${accessToken}`,
//   }
//
//   return request
// }
//
// export const attachUnAuthorizedErrorHandler =
//   (getNewAccessToken: () => Promise<string>, catcherCb: () => Promise<void>) =>
//   async (response: FetcherResponse<JsonApiResponseErrors>) => {
//     const isUnauthorizedException = response?.status === HTTP_STATUS_CODES.UNAUTHORIZED
//
//     if (!isUnauthorizedException) return response
//
//     try {
//       // TODO: add some kind of debounce to prevent multiple refreshing
//       const accessToken = await getNewAccessToken()
//
//       const url = new URL(response?.request.url)
//
//       // continue the request with the new access token
//       return new Fetcher({ baseUrl: url.origin }).request({
//         endpoint: url.pathname,
//         method: response?.request.method as HTTP_METHODS,
//         ...(response?.request?.body && { body: response?.request.body }),
//         headers: {
//           ...response?.request.headers,
//           Authorization: `Bearer ${accessToken}`,
//         },
//       })
//     } catch (error) {
//       await catcherCb()
//
//       return Promise.reject(error)
//     }
//   }
