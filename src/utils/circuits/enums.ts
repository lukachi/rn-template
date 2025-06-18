export enum CircuitDocumentType {
  TD1 = 1,
  TD3 = 3,
}

export enum CircuitAlgorithm {
  RSA = 'RSA',
  RSAPSS = 'RSA-PSS',
  ECDSA = 'ECDSA',
}

export enum CircuitHashAlgorithm {
  SHA160 = 160,
  SHA256 = 256,
  SHA384 = 384,
  SHA224 = 224,
  SHA512 = 512,
}

export enum CircuitKeySize {
  B1024 = 1024,
  B2048 = 2048,
  B4096 = 4096,
  B256 = 256,
  B320 = 320,
  B192 = 192,
  B384 = 384,
  B3072 = 3072,
  B224 = 224,
  B512 = 512,
  B521 = 521,
}

export enum CircuitExponent {
  E3 = 3,
  E65537 = 65537,
}

export enum CircuitSalt {
  S32 = 32,
  S64 = 64,
  S48 = 48,
}
