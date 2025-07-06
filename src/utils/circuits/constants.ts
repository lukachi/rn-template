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
