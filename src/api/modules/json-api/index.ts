import Jsona from 'jsona'
import { createQuery } from 'react-query-kit'

import { Config } from '@/config'

const dataFormatter = new Jsona()

type Product = {
  links: {
    self: string
    next: string
    last: string
  }
  data: Array<{
    type: string
    id: string
    attributes: {
      title: string
    }
    relationships: {
      author: {
        links: {
          self: string
          related: string
        }
        data: {
          type: string
          id: string
        }
      }
      comments: {
        links: {
          self: string
          related: string
        }
        data: Array<{
          type: string
          id: string
        }>
      }
    }
    links: {
      self: string
    }
  }>
  included: Array<{
    type: string
    id: string
    attributes: {
      firstName?: string
      lastName?: string
      twitter?: string
      body?: string
    }
    links: {
      self: string
    }
    relationships?: {
      author: {
        data: {
          type: string
          id: string
        }
      }
    }
  }>
}

export type Response = { products: Product[]; total: number; skip: number; limit: number }
type Variables = void // as react-query-kit is strongly typed, we need to specify the type of the variables as void in case we don't need them

export const useJsonApiTest = createQuery<Response, Variables, Error>({
  queryKey: ['json-api-test'],
  fetcher: async (): Promise<Response> => {
    // return getApiClient()
    //   .get<Response>('/integrations/geo-points-svc/v1/public/event_types')
    //   .then(res => res.data)

    return fetch(`${Config.API_URL}/integrations/geo-points-svc/v1/public/event_types`)
      .then(res => res.json())
      .then(res => dataFormatter.deserialize(res) as Response)
  },
})
