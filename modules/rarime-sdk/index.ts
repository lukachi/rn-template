// Import the native module. On web, it will be resolved to RarimeSdk.web.ts
// and on native platforms to RarimeSdk.ts
import RarimeSdkModule from './src/RarimeSdkModule'

export async function generatePrivateKey(): Promise<Uint8Array> {
  return await RarimeSdkModule.generatePrivateKey()
}

export async function calculateEventNullifierInt(
  event: string,
  secretKey: string,
): Promise<string> {
  return await RarimeSdkModule.calculateEventNullifierInt(event, secretKey)
}

export async function registrationChallenge(secretKey: string): Promise<Uint8Array> {
  return await RarimeSdkModule.registrationChallenge(secretKey)
}

export async function getSlaveCertIndex(
  slaveCertPem: Uint8Array,
  icaoBytes: Uint8Array,
): Promise<string> {
  return await RarimeSdkModule.getSlaveCertIndex(
    new Uint8Array(slaveCertPem),
    new Uint8Array(icaoBytes),
  )
}

export async function getX509RSASize(publicKeyPem: Uint8Array): Promise<number> {
  return await RarimeSdkModule.getX509RSASize(new Uint8Array(publicKeyPem))
}
