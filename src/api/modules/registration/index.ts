import { apiClient } from '@/api/client'

export const relayerRegister = async (callDataHex: string, destinationContractAddress: string) => {
  return apiClient.post<{
    id: '0x8bc06afbb12c72cce67c36fc9433c62d35e49877812d34d9cc1d5b5d914f905d'
    type: 'txs'
    tx_hash: '0x8bc06afbb12c72cce67c36fc9433c62d35e49877812d34d9cc1d5b5d914f905d'
  }>('/integrations/registration-relayer/v1/register', {
    data: {
      tx_data: callDataHex,
      destination: destinationContractAddress,
    },
  })
}
