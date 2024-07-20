export type EventType = {
  id: string
  type: string
  name: string
  reward: number
  title: string
  description: string
  short_description: string
  frequency: string
  starts_at: string
  expires_at: string
  action_url: string
  logo: string
  flag: string
  auto_claim: boolean
  disabled: boolean
  qr_code_value: string
  usage_count: number
}[]
