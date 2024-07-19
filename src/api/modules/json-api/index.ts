import axios from 'axios'
import Jsona from 'jsona'
import { createQuery } from 'react-query-kit'

const dataFormatter = new Jsona()

// this is the copy of apiClient from src/api/client.tsx, for test purposes
const apiClient = axios.create({
  baseURL: 'https://api.geo.stage.rarime.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(response => {
  try {
    return {
      ...response,
      data: dataFormatter.deserialize(response.data),
    }
  } catch (error) {
    console.error('Could not deserialize data', error)
    return response
  }
})

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
  fetcher: async () => {
    const res = await apiClient.get('/integrations/geo-points-svc/v1/public/event_types')
    return res.data
  },
})
