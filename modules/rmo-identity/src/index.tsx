const RmoIdentity = require('./NativeRmoIdentity').default

export function multiply(a: number, b: number): number {
  return RmoIdentity.multiply(a, b)
}

export function generatePrivateKey(): Promise<string> {
  return RmoIdentity.generatePrivateKey()
}

export function calculateEventNullifierInt(event: string, secretKey: string): Promise<string> {
  return RmoIdentity.calculateEventNullifierInt(event, secretKey)
}
