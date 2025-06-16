// Import the native module. On web, it will be resolved to RarimeSdk.web.ts
// and on native platforms to RarimeSdk.ts

import RarimeSdkModule from './src/RarimeSdkModule'

export async function buildRegisterIdentityInputs({
  privateKeyHex,
  encapsulatedContent,
  signedAttributes,
  sodSignature,
  dg1,
  dg15,
  pubKeyPem,
  smtProofJson,
}: {
  privateKeyHex: string
  encapsulatedContent: Uint8Array
  signedAttributes: Uint8Array
  sodSignature: Uint8Array
  dg1: Uint8Array
  dg15: Uint8Array
  pubKeyPem: Uint8Array
  smtProofJson: Uint8Array
}): Promise<Uint8Array> {
  return await RarimeSdkModule.buildRegisterIdentityInputs(
    privateKeyHex,
    new Uint8Array(encapsulatedContent),
    new Uint8Array(signedAttributes),
    new Uint8Array(sodSignature),
    new Uint8Array(dg1),
    new Uint8Array(dg15),
    new Uint8Array(pubKeyPem),
    new Uint8Array(smtProofJson),
  )
}
