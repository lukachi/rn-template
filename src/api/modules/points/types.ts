import type { EventFlags, EventFrequency, EventStatus, ReferralCodeStatuses } from './enums'

export type PointsBalance = {
  id: string
  type: 'balance'

  amount: number
  is_disabled: boolean
  is_verified: boolean
  created_at: number
  updated_at: number

  rank?: number
  level: number

  referral_codes?: {
    id: string
    status: ReferralCodeStatuses
  }[]
}

export type PointsWithdrawal = {
  id: string
  type: 'withdrawal'

  amount: number
  address: string
  created_at: number

  balance?: PointsBalance
}

export type PointsEventType = {
  id: string
  type: 'event_type'

  name: string
  reward: number
  title: string
  description: string
  short_description: string
  frequency: string
  starts_at: string // utc format '2020-01-01T00:00:00.000Z'
  expires_at: string // utc format '2020-01-01T00:00:00.000Z'
  action_url: string // url
  logo: string // url
  flag: EventFlags
}

export type PointsEvent = {
  id: string
  type: 'event'

  status: EventStatus
  created_at: number
  updated_at: number
  has_expiration: true
  meta: {
    static: {
      name: string
      reward: number
      title: string
      description: string
      short_description: string
      frequency: EventFrequency
      flag: ReferralCodeStatuses

      starts_at?: string // utc format '2020-01-01T00:00:00.000Z'
      expires_at?: string // utc format '2020-01-01T00:00:00.000Z'
      action_url?: string // url

      logo?: string // url
    }
    dynamic?: {
      id: string
    }
  }
  points_amount?: number

  balance?: PointsBalance
}
