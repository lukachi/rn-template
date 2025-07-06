import { CHash } from '@noble/curves/utils'
import { sha1 } from '@noble/hashes/legacy'
import { sha224, sha256, sha384, sha512 } from '@noble/hashes/sha2'
import { id_sha1, id_sha224, id_sha256, id_sha384, id_sha512 } from '@peculiar/asn1-rsa'

export enum CircuitDocumentType {
  TD1 = 1,
  TD3 = 3,
}

export const HASH_ALGORITHMS: Record<string, { len: number; hasher: CHash }> = {
  [id_sha1]: { len: 20, hasher: sha1 }, // sha1
  [id_sha224]: { len: 28, hasher: sha224 }, // sha224
  [id_sha256]: { len: 32, hasher: sha256 }, // sha256
  [id_sha384]: { len: 48, hasher: sha384 }, // sha384
  [id_sha512]: { len: 64, hasher: sha512 }, // sha512
}

export enum CircuitHashAlgorithmName {
  SHA1 = 'SHA1',
  SHA384 = 'SHA384',
  SHA512 = 'SHA512',
  SHA2 = 'SHA2',
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
