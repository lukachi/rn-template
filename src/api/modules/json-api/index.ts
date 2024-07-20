import axios from 'axios'
import Jsona from 'jsona'

import type { EventType } from './types'

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

export const getEventTypes = async () => {
  return apiClient.get<EventType[]>('/integrations/geo-points-svc/v1/public/event_types')
}

export * from './types'
