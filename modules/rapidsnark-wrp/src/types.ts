export type ZKProof = {
  proof: ProofData
  pub_signals: string[]
}

export type ProofData = {
  pi_a: string[]
  pi_b: string[][]
  pi_c: string[]
  protocol: string
}
