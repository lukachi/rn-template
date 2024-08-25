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
