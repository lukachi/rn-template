export enum ReferralCodeStatuses {
  Active = 'active',
  Banned = 'banned',
  Limited = 'limited',
  Awaiting = 'awaiting',
  Rewarded = 'rewarded',
  Consumed = 'consumed',
}

export enum EventFlags {
  Active = 'active',
  NotStarted = 'not_started',
  Expired = 'expired',
  Disabled = 'disabled',
}

export enum EventStatus {
  Open = 'open',
  Fulfilled = 'fulfilled',
  Claimed = 'claimed',
}

export enum EventFrequency {
  OneTime = 'one-time',
  Daily = 'daily',
  Weekly = 'weekly',
  Unlimited = 'unlimited',
}
