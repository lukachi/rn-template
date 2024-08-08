const RmoIdentity = require('./NativeRmoIdentity').default

export function multiply(a: number, b: number): number {
  return RmoIdentity.multiply(a, b)
}

export function generatePrivateKey(): Promise<string> {
  return RmoIdentity.generatePrivateKey()
}
