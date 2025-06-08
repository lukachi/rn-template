// Import the native module. On web, it will be resolved to RarimeSdk.web.ts
// and on native platforms to RarimeSdk.ts

import RarimeSdkModule from './src/RarimeSdkModule'

export async function buildRegisterCertificateCallData(
  cosmosAddr: string,
  slavePem: Uint8Array,
  masterCertificatesBucketName: string,
  masterCertificatesFilename: string,
): Promise<Uint8Array> {
  return await RarimeSdkModule.buildRegisterCertificateCallData(
    cosmosAddr,
    new Uint8Array(slavePem),
    masterCertificatesBucketName,
    masterCertificatesFilename,
  )
}

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

export async function buildRegisterCallData(
  regProofJson: Uint8Array,
  AASignature: Uint8Array,
  dg15PubKeyPem: Uint8Array,
  masterCertSmtProofRoot: Uint8Array,
  CircuitTypeCertificatePubKeySize: number,
  isRevoked: boolean,
): Promise<Uint8Array> {
  return await RarimeSdkModule.buildRegisterCallData(
    new Uint8Array(regProofJson),
    new Uint8Array(AASignature),
    new Uint8Array(dg15PubKeyPem),
    new Uint8Array(masterCertSmtProofRoot),
    CircuitTypeCertificatePubKeySize,
    isRevoked,
  )
}

export async function buildRevoceCalldata(
  activeIdentity: Uint8Array,
  eDocSignature: Uint8Array,
  dg15PubKeyPem: Uint8Array,
): Promise<Uint8Array> {
  return await RarimeSdkModule.buildRevoceCalldata(
    new Uint8Array(activeIdentity),
    new Uint8Array(eDocSignature),
    new Uint8Array(dg15PubKeyPem),
  )
}
