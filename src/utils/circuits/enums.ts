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

export enum CircuitSignatureType {
  ST1 = 1, //   - 1: RSA 2048 bits + SHA2-256 + e = 65537
  ST2 = 2, //   - 2: RSA 4096 bits + SHA2-256 + e = 65537
  ST3 = 3, //   - 3: RSA 2048 bits + SHA1 + e = 65537
  ST10 = 10, //   - 10: RSASSA-PSS 2048 bits MGF1 (SHA2-256) + SHA2-256 + e = 3 + salt = 32
  ST11 = 11, //   - 11: RSASSA-PSS 2048 bits MGF1 (SHA2-256) + SHA2-256 + e = 65537 + salt = 32
  ST12 = 12, //   - 12: RSASSA-PSS 2048 bits MGF1 (SHA2-256) + SHA2-256 + e = 65537 + salt = 64
  ST13 = 13, //   - 13: RSASSA-PSS 2048 bits MGF1 (SHA2-384) + SHA2-384 + e = 65537 + salt = 48
  ST14 = 14, //   - 14: RSASSA-PSS 3072 bits MGF1 (SHA2-256) + SHA2-256 + e = 65537 + salt = 32
  ST15 = 15, //   - 15: RSASSA-PSS 3072 bits MGF1 (SHA2-512) + SHA2-512 + e = 65537 + salt = 64
  ST20 = 20, //   - 20: ECDSA brainpoolP256r1 + SHA256
  ST21 = 21, //   - 21: ECDSA secp256r1 + SHA256
  ST22 = 22, //   - 22: ECDSA brainpoolP320r1 + SHA256
  ST23 = 23, //   - 23: ECDSA secp192r1 + SHA1
}
