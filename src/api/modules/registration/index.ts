import { apiClient } from '@/api/client'

export const relayerRegister = async (callDataHex: string, destinationContractAddress: string) => {
  return apiClient.post<{
    id: string
    type: 'txs'
    tx_hash: string
  }>('/integrations/registration-relayer/v1/register', {
    data: {
      tx_data: callDataHex,
      destination: destinationContractAddress,
    },
  })
}
