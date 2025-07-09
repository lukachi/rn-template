import { Groth16Proof, Groth16ProofPoints, NumberLike, NumericString } from '@solarity/zkit'

export type PrivateRegisterIdentityLightGroth16 = {
  dg1: NumberLike[]
  skIdentity: NumberLike
}

export type PublicRegisterIdentityLightGroth16 = {
  dg1Hash: NumberLike
  dg1Commitment: NumberLike
  pkIdentityHash: NumberLike
}

export type ProofRegisterIdentityLightGroth16 = {
  proof: Groth16Proof
  publicSignals: PublicRegisterIdentityLightGroth16
}

export type CalldataRegisterIdentityLightGroth16 = {
  proofPoints: Groth16ProofPoints
  publicSignals: [NumericString, NumericString, NumericString]
}
