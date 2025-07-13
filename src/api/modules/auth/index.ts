import { CircomZKProof } from '@modules/witnesscalculator'

import { apiClient } from '@/api/client'

// fixme: ZkProof type
export const authorize = async (nullifierHex: string, zkProof: CircomZKProof) => {
  return apiClient.post<{
    id: string
    type: 'token'

    access_token: {
      token: string
      token_type: 'access'
    }
    refresh_token: {
      token: string
      token_type: 'refresh'
    }
  }>('/integrations/decentralized-auth-svc/v1/authorize', {
    data: {
      id: nullifierHex,
      type: 'authorize',

      attributes: {
        proof: zkProof,
      },
    },
  })
}

export const refresh = async () => {
  return apiClient.get<{
    access_token: string
    refresh_token: string
  }>('/integrations/decentralized-auth-svc/v1/refresh')
}

export const getChallenge = async (nullifierHex: string) => {
  return apiClient.get<{
    challenge: string
    id: string
    type: 'challenge'
  }>(`/integrations/decentralized-auth-svc/v1/authorize/${nullifierHex}/challenge`)
}
