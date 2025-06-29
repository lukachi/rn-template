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
  SHA1 = 'SHA1',
  SHA384 = 'SHA384',
  SHA512 = 'SHA512',
  SHA2 = 'SHA2',
}

export enum CircuitHashType {
  SHA160 = 160, // - 160: SHA1 (160 bits)
  SHA256 = 256, // - 224: SHA2-224 (224 bits)
  SHA384 = 384, // - 256: SHA2-256 (256 bits)
  SHA224 = 224, // - 384: SHA2-384 (384 bits)
  SHA512 = 512, // - 512: SHA2-512 (512 bits)
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

// =============================================================================================

export enum CircuitSignatureType {
  RSA_2048_SHA2_256_E = 1, //                               1: RSA 2048 bits + SHA2-256 + e = 65537
  RSA_4096_SHA2_256_E = 2, //                               2: RSA 4096 bits + SHA2-256 + e = 65537
  RSA_2048_SHA1_E = 3, //                                   3: RSA 2048 bits + SHA1 + e = 65537
  RSASSA_PSS_2048_MGF1_SHA2_256_E__3_SALT_32 = 10, //       10: RSASSA-PSS 2048 bits MGF1 (SHA2-256) + SHA2-256 + e = 3 + salt = 32
  RSASSA_PSS_2048_MGF1_SHA2_256_E__65537_SALT_32 = 11, //   11: RSASSA-PSS 2048 bits MGF1 (SHA2-256) + SHA2-256 + e = 65537 + salt = 32
  RSASSA_PSS_2048_MGF1_SHA2_256_E__65537_SALT_64 = 12, //   12: RSASSA-PSS 2048 bits MGF1 (SHA2-256) + SHA2-256 + e = 65537 + salt = 64
  RSASSA_PSS_2048_MGF1_SHA2_384_E = 13, //                  13: RSASSA-PSS 2048 bits MGF1 (SHA2-384) + SHA2-384 + e = 65537 + salt = 48
  RSASSA_PSS_3072_MGF1_SHA2_256_E = 14, //                  14: RSASSA-PSS 3072 bits MGF1 (SHA2-256) + SHA2-256 + e = 65537 + salt = 32
  RSASSA_PSS_3072_MGF1_SHA2_512_E = 15, //                  15: RSASSA-PSS 3072 bits MGF1 (SHA2-512) + SHA2-512 + e = 65537 + salt = 64
  ECDSA_brainpoolP256r1_SHA256 = 20, //                     20: ECDSA brainpoolP256r1 + SHA256
  ECDSA_secp256r1_SHA256 = 21, //                           21: ECDSA secp256r1 + SHA256
  ECDSA_brainpoolP320r1_SHA256 = 22, //                     22: ECDSA brainpoolP320r1 + SHA256
  ECDSA_secp192r1_SHA1 = 23, //                             23: ECDSA secp192r1 + SHA1
}

// =============================================================================================

// AA_SIGNATURE_TYPE:
//   - 0: NO AA
//   - 1: RSA 1024 bits + SHA2-256 + e = 65537

//   - 20: ECDSA brainpoolP256r1 + SHA256
//   - 21: ECDSA secp256r1 + SHA256
//   - 22: ECDSA brainpoolP320r1 + SHA256
//   - 23: ECDSA secp192r1 + SHA1
