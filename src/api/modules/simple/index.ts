import axios from 'axios'

import type { Product } from './types'

// this is the copy of apiClient from src/api/client.tsx, for test purposes
const apiClient = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getProducts = async () => {
  return apiClient.get<{ products: Product[] }>('/products')
}

export * from './types'
