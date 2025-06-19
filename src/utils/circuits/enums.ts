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

export enum CircuitEcChunkNumber {
  N3 = 3,
  N4 = 4,
  N5 = 5,
  N6 = 6,
  N7 = 7,
}

export enum CircuitDg15EcChunkNumber {
  N2432 = 2432,
  N2448 = 2448,
  N3072 = 3072,
  N1184 = 1184,
  N1480 = 1480,
  N1496 = 1496,
  N1808 = 1808,
  N1512 = 1512,
  N864 = 864,
  N2744 = 2744,
  N1296 = 1296,
}
