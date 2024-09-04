import type { ZKProof } from '@modules/rapidsnark-wrp'

import { apiClient } from '@/api/client'

import type { EventFlags, EventStatus } from './enums'
import type { PointsBalance, PointsEvent, PointsEventType, PointsWithdrawal } from './types'

export const createPointsBalance = async (userPointsNullifierHex: string, referralCode: string) => {
  return apiClient.post<PointsBalance>('/integrations/rarime-points-svc/v1/public/balances', {
    id: userPointsNullifierHex,
    type: 'create_balance',
    attributes: {
      referred_by: referralCode,
    },
  })
}

export const getLeaderboard = async (params?: {
  page?: {
    limit?: number
    number?: number
    order?: 'asc' | 'desc'
  }
  count?: boolean
}) => {
  return apiClient.get<PointsBalance[]>('/integrations/rarime-points-svc/v1/public/balances', {
    ...(params && { params }),
  })
}

export const getPointsBalance = async (userPointsNullifierHex: string) => {
  return apiClient.get<PointsBalance>(
    `/integrations/rarime-points-svc/v1/public/balances/${userPointsNullifierHex}`,
  )
}

export const joinRewardsProgram = async (params: {
  userPointsNullifierHex: string
  signature: string
  anonymousID: string
  country: string
  proof: ZKProof // TODO: not sure
}) => {
  return apiClient.post<{
    id: string
    type: 'passport_event_state'

    claimed: boolean
  }>(
    `/integrations/rarime-points-svc/v1/public/balances/${params.userPointsNullifierHex}/join_program`,
    {
      id: params.userPointsNullifierHex,
      type: 'verify_passport',
      attributes: {
        anonymous_id: params.anonymousID,
        country: params.country,
        proof: params.proof,
      },
    },
    {
      headers: {
        Signature: params.signature,
      },
    },
  )
}

export const verifyPassport = async (params: {
  userPointsNullifierHex: string
  signature: string
  anonymousID: string
  country: string
  proof: ZKProof // TODO: not sure
}) => {
  return apiClient.post<{
    id: string
    type: 'passport_event_state'

    claimed: boolean
  }>(
    `/integrations/rarime-points-svc/v1/public/balances/${params.userPointsNullifierHex}/verifypassport`,
    {
      id: params.userPointsNullifierHex,
      type: 'verify_passport',
      attributes: {
        anonymous_id: params.anonymousID,
        country: params.country,
        proof: params.proof,
      },
    },
    {
      headers: {
        Signature: params.signature,
      },
    },
  )
}

export const getWithdrawalHistory = async (
  userPointsNullifierHex: string,
  params?: {
    page?: {
      limit?: number
      cursor?: number
      order?: 'asc' | 'desc'
    }
    count?: boolean
  },
) => {
  return apiClient.get<PointsWithdrawal>(
    `/integrations/rarime-points-svc/v1/public/balances/${userPointsNullifierHex}/withdrawals`,
    {
      ...(params && { params }),
    },
  )
}

export const withdrawPoints = async (
  userPointsNullifierHex: string,
  params: {
    amount: number
    address: string
    proof: ZKProof
  },
) => {
  return apiClient.post<{}>(
    `/integrations/rarime-points-svc/v1/public/balances/${userPointsNullifierHex}/withdrawals`,
    {
      id: userPointsNullifierHex,
      type: 'withdraw',
      attributes: {
        amount: params.amount,
        address: params.address,
        proof: params.proof,
      },
    },
  )
}

export const getPointsPrice = async () => {
  return apiClient.get<{
    type: 'point_price'

    urmo: number
    withdrawal_allowed: boolean
  }>('/integrations/rarime-points-svc/v1/public/point_price')
}

export const getCountriesConfiguration = async () => {
  return apiClient.get<{
    type: 'countries_config'

    countries: {
      code: string
      reserve_allowed: boolean
      withdrawal_allowed: boolean
    }[]
  }>(`/integrations/rarime-points-svc/v1/public/countries_config`)
}

export const getEventTypes = async (params?: {
  filter?: {
    name?:
      | string
      | {
          not?: string // FIXME: not sure
        }
    flag?: EventFlags
  }
}) => {
  return apiClient.get<{
    data: PointsEventType[]
  }>(`/integrations/rarime-points-svc/v1/public/event_types`, {
    ...(params && { params }),
  })
}

export const getEvents = async (params: {
  filter: {
    nullifier: string
    status?: EventStatus
    ['meta.static.name']?:
      | string
      | {
          not?: string // FIXME: not sure
        }
    has_expiration?: boolean
    count?: boolean
    page?: {
      limit?: number
      number?: number
      order?: 'asc' | 'desc'
    }
  }
}) => {
  return apiClient.get<{
    data: PointsEvent[]
    meta: {
      events_count: number
    }
  }>(`/integrations/rarime-points-svc/v1/public/events`, {
    params,
  })
}

export const getEvent = async (id: string) => {
  return apiClient.get<PointsEvent>(`/integrations/rarime-points-svc/v1/public/events/${id}`)
}

export const claimPointsForEvent = async (id: string) => {
  return apiClient.patch<PointsEvent>(
    `https://api.stage.rarime.com/integrations/rarime-points-svc/v1/public/events/${id}`,
    {
      id: id,
      type: 'claim_event',
    },
  )
}
