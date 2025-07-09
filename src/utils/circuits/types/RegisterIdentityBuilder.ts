import { Groth16Proof, Groth16ProofPoints, NumberLike, NumericString } from '@solarity/zkit'

export type PrivateRegisterIdentityBuilderGroth16 = {
  encapsulatedContent: NumberLike[]
  dg1: NumberLike[]
  dg15: NumberLike[]
  signedAttributes: NumberLike[]
  signature: NumberLike[]
  pubkey: NumberLike[]
  slaveMerkleRoot: NumberLike
  slaveMerkleInclusionBranches: NumberLike[]
  skIdentity: NumberLike
}

export type PublicRegisterIdentityBuilderGroth16 = {
  dg15PubKeyHash: NumberLike
  passportHash: NumberLike
  dg1Commitment: NumberLike
  pkIdentityHash: NumberLike
  slaveMerkleRoot: NumberLike
}

export type ProofRegisterIdentityBuilderGroth16 = {
  proof: Groth16Proof
  publicSignals: PublicRegisterIdentityBuilderGroth16
}

export type CalldataRegisterIdentityBuilderGroth16 = {
  proofPoints: Groth16ProofPoints
  publicSignals: [NumericString, NumericString, NumericString, NumericString, NumericString]
}

export type QualifiedSignalNames =
  | 'main.dg15PubKeyHash'
  | 'main.passportHash'
  | 'main.dg1Commitment'
  | 'main.pkIdentityHash'
  | 'main.slaveMerkleRoot'
