import { Groth16Proof, Groth16ProofPoints, NumberLike, NumericString } from '@solarity/zkit'

export type PrivateQueryIdentityGroth16 = {
  eventID: NumberLike
  eventData: NumberLike
  idStateRoot: NumberLike
  selector: NumberLike
  currentDate: NumberLike
  timestampLowerbound: NumberLike
  timestampUpperbound: NumberLike
  identityCounterLowerbound: NumberLike
  identityCounterUpperbound: NumberLike
  birthDateLowerbound: NumberLike
  birthDateUpperbound: NumberLike
  expirationDateLowerbound: NumberLike
  expirationDateUpperbound: NumberLike
  citizenshipMask: NumberLike
  skIdentity: NumberLike
  pkPassportHash: NumberLike
  dg1: NumberLike[]
  idStateSiblings: NumberLike[]
  timestamp: NumberLike
  identityCounter: NumberLike
}

export type PublicQueryIdentityGroth16 = {
  nullifier: NumberLike
  birthDate: NumberLike
  expirationDate: NumberLike
  name: NumberLike
  nameResidual: NumberLike
  nationality: NumberLike
  citizenship: NumberLike
  sex: NumberLike
  documentNumber: NumberLike
  eventID: NumberLike
  eventData: NumberLike
  idStateRoot: NumberLike
  selector: NumberLike
  currentDate: NumberLike
  timestampLowerbound: NumberLike
  timestampUpperbound: NumberLike
  identityCounterLowerbound: NumberLike
  identityCounterUpperbound: NumberLike
  birthDateLowerbound: NumberLike
  birthDateUpperbound: NumberLike
  expirationDateLowerbound: NumberLike
  expirationDateUpperbound: NumberLike
  citizenshipMask: NumberLike
}

export type ProofQueryIdentityGroth16 = {
  proof: Groth16Proof
  publicSignals: PublicQueryIdentityGroth16
}

export type CalldataQueryIdentityGroth16 = {
  proofPoints: Groth16ProofPoints
  publicSignals: [
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
    NumericString,
  ]
}

/**
 * Proof input parameters for QueryIdentityCircuit.
 */
export interface QueryProofParams {
  eventId?: string
  eventData?: string
  idStateRoot?: string
  selector?: string
  timestampLower?: string
  timestampUpper?: string
  timestamp?: string
  identityCounter?: string
  identityCountLower?: string
  identityCountUpper?: string
  birthDateLower?: string
  birthDateUpper?: string
  expirationDateLower?: string
  expirationDateUpper?: string
  citizenshipMask?: string
  skIdentity?: string
  pkPassportHash?: string
  dg1?: string[] // array of byte values as strings
  siblings?: string[] // array of branch nodes
}
