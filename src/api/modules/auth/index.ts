import { apiClient } from '@/api/client'

// fixme: ZkProof type
export const authorize = async (nullifierHex: string, zkProof: any) => {
  return apiClient.post('/integrations/geo-auth-svc/v1/authorize', {
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
  return apiClient.get(`/integrations/geo-auth-svc/v1/authorize/${nullifierHex}/challenge`)
}
