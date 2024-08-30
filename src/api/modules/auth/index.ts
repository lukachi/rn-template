import type { ZKProof } from '@modules/rapidsnark-wrp'

import { apiClient } from '@/api/client'

// fixme: ZkProof type
export const authorize = async (nullifierHex: string, zkProof: ZKProof) => {
  return apiClient.post<{
    access_token: {
      token: string
      token_type: 'access'
    }
    id: string
    refresh_token: {
      token: string
      token_type: 'refresh'
    }
    type: 'token'
  }>('/integrations/geo-auth-svc/v1/authorize', {
    data: {
      id: nullifierHex,
      type: 'authorize',

      attributes: {
        proof: zkProof,
      },
    },
  })
}

export const getChallenge = async (nullifierHex: string) => {
  return apiClient.get<{
    challenge: string
    id: string
    type: 'challenge'
  }>(`/integrations/geo-auth-svc/v1/authorize/${nullifierHex}/challenge`)
}
