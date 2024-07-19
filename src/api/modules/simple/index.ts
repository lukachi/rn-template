import axios from 'axios'
import { createQuery } from 'react-query-kit'

// this is the copy of apiClient from src/api/client.tsx, for test purposes
const apiClient = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

type Product = {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand: string
  sku: string
  weight: string
  dimensions: {
    width: string
    height: string
    depth: string
  }
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  reviews: {
    rating: number
    comment: string
    date: string
    reviewerName: string
    reviewerEmail: string
  }[]
  returnPolicy: string
  minimumOrderQuantity: number
  meta: {
    createdAt: string
    updatedAt: string
    barcode: string
    qrCode: string
  }
  thumbnail: string
  images: string[]
}

type Response = { products: Product[]; total: number; skip: number; limit: number }
type Variables = void // as react-query-kit is strongly typed, we need to specify the type of the variables as void in case we don't need them

export const useProducts = createQuery<Response, Variables, Error>({
  queryKey: ['products'],
  fetcher: async () => {
    let response = await apiClient.get('/products')
    return await response.data
  },
})
