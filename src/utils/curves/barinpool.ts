// brainpool.ts – Brainpool curves implemented via noble-curves
// Ported from the Go implementation (github.com/.../brainpool) to TypeScript.
// Requires noble‑curves v2 (and noble‑hashes)
//
// Only public‑API helpers are exported; the rest is private implementation detail.
//
// © 2025, MIT licence.

import { Field } from '@noble/curves/abstract/modular.js'
import { weierstrass } from '@noble/curves/abstract/weierstrass.js'
import { hmac } from '@noble/hashes/hmac'
import { sha256 } from '@noble/hashes/sha2'
import { concatBytes, randomBytes } from '@noble/hashes/utils'

/****************************************************************************************
 * Utilities                                                                            *
 ****************************************************************************************/

const hmacSha256 = (key: Uint8Array, ...msgs: Uint8Array[]) =>
  hmac(sha256, key, concatBytes(...msgs))

const BN = (hex: string) => BigInt(hex)

/** Converts an uncompressed point (04 || x || y) to {x,y}. */
export function splitUncompressedPoint(bytes: Uint8Array) {
  if (bytes[0] !== 0x04) throw new Error('only uncompressed points supported')
  const m = (bytes.length - 1) / 2
  return {
    x: bytes.slice(1, 1 + m),
    y: bytes.slice(1 + m),
  }
}

/****************************************************************************************
 * Curve definition helper                                                              *
 ****************************************************************************************/

type BrainParams = {
  p: string // prime field
  a?: string // short‑Weierstrass A. If omitted (t1 curves) we set a = p − 3
  b: string // coefficient B
  n: string // subgroup order
  gx: string
  gy: string
  h?: string // cofactor, defaults → 1
}

function mkBrainpool(
  name: string,
  p: string,
  aHex: string,
  b: string,
  n: string,
  gx: string,
  gy: string,
  h = '0x1',
) {
  const a = BN(aHex)
  const params = {
    a,
    b: BN(b),
    Fp: Field(BN(p)),
    n: BN(n),
    h: BN(h),
    Gx: BN(gx),
    Gy: BN(gy),
    hash: sha256,
    hmac: hmacSha256,
    randomBytes,
  } as const
  return weierstrass(params)
}

function mkT1(name: string, p: string, b: string, n: string, gx: string, gy: string) {
  const prime = BN(p)
  const a = (prime - 3n) % prime // t1 curves have A = −3 mod p
  return mkBrainpool(name, p, '0x' + a.toString(16), b, n, gx, gy)
}

/****************************************************************************************
 * Raw parameters (hex strings exactly as in RFC 5639)                                  *
 ****************************************************************************************/

const r1: Record<string, BrainParams> = {
  brainpoolP160r1: {
    p: '0xe95e4a5f737059dc60dfc7ad95b3d8139515620f',
    a: '0x340e7be2a280eb74e2be61bada745d97e8f7c300',
    b: '0x1e589a8595423412134faa2dbdec95c8d8675e58',
    n: '0xe95e4a5f737059dc60df5991d45029409e60fc09',
    gx: '0xbed5af16ea3f6a4f62938c4631eb5af7bdbcdbc3',
    gy: '0x1667cb477a1a8ec338f94741669c976316da6321',
  },
  brainpoolP192r1: {
    p: '0xc302f41d932a36cda7a3463093d18db78fce476de1a86297',
    a: '0x6a91174076b1e0e19c39c031fe8685c1cae040e5c69a28ef',
    b: '0x469a28ef7c28cca3dc721d044f4496bcca7ef4146fbf25c9',
    n: '0xc302f41d932a36cda7a3462f9e9e916b5be8f1029ac4acc1',
    gx: '0xc0a0647eaab6a48753b033c56cb0f0900a2f5c4853375fd6',
    gy: '0x14b690866abd5bb88b5f4828c1490002e6773fa2fa299b8f',
  },
  brainpoolP224r1: {
    p: '0xd7c134aa264366862a18302575d1d787b09f075797da89f57ec8c0ff',
    a: '0x68a5e62ca9ce6c1c299803a6c1530b514e182ad8b0042a59cad29f43',
    b: '0x2580f63ccfe44138870713b1a92369e33e2135d266dbb372386c400b',
    n: '0xd7c134aa264366862a18302575d0fb98d116bc4b6ddebca3a5a7939f',
    gx: '0xd9029ad2c7e5cf4340823b2a87dc68c9e4ce3174c1e6efdee12c07d',
    gy: '0x58aa56f772c0726f24c6b89e4ecdac24354b9e99caa3f6d3761402cd',
  },
  brainpoolP256r1: {
    p: '0xa9fb57dba1eea9bc3e660a909d838d726e3bf623d52620282013481d1f6e5377',
    a: '0x7d5a0975fc2c3057eef67530417affe7fb8055c126dc5c6ce94a4b44f330b5d9',
    b: '0x26dc5c6ce94a4b44f330b5d9bbd77cbf958416295cf7e1ce6bccdc18ff8c07b6',
    n: '0xa9fb57dba1eea9bc3e660a909d838d718c397aa3b561a6f7901e0e82974856a7',
    gx: '0x8bd2aeb9cb7e57cb2c4b482ffc81b7afb9de27e1e3bd23c23a4453bd9ace3262',
    gy: '0x547ef835c3dac4fd97f8461a14611dc9c27745132ded8e545c1d54c72f046997',
  },
  brainpoolP320r1: {
    p: '0xd35e472036bc4fb7e13c785ed201e065f98fcfa6f6f40def4f92b9ec7893ec28fcd412b1f1b32e27',
    a: '0x3ee30b568fbab0f883ccebd46d3f3bb8a2a73513f5eb79da66190eb085ffa9f492f375a97d860eb4',
    b: '0x520883949dfdbc42d3ad198640688a6fe13f41349554b49acc31dccd884539816f5eb4ac8fb1f1a6',
    n: '0xd35e472036bc4fb7e13c785ed201e065f98fcfa5b68f12a32d482ec7ee8658e98691555b44c59311',
    gx: '0x43bd7e9afb53d8b85289bcc48ee5bfe6f20137d10a087eb6e7871e2a10a599c710af8d0d39e20611',
    gy: '0x14fdd05545ec1cc8ab4093247f77275e0743ffed117182eaa9c77877aaac6ac7d35245d1692e8ee1',
  },
  brainpoolP384r1: {
    p: '0x8cb91e82a3386d280f5d6f7e50e641df152f7109ed5456b412b1da197fb71123acd3a729901d1a71874700133107ec53',
    a: '0x7bc382c63d8c150c3c72080ace05afa0c2bea28e4fb22787139165efba91f90f8aa5814a503ad4eb04a8c7dd22ce2826',
    b: '0x4a8c7dd22ce28268b39b55416f0447c2fb77de107dcd2a62e880ea53eeb62d57cb4390295dbc9943ab78696fa504c11',
    n: '0x8cb91e82a3386d280f5d6f7e50e641df152f7109ed5456b31f166e6cac0425a7cf3ab6af6b7fc3103b883202e9046565',
    gx: '0x1d1c64f068cf45ffa2a63a81b7c13f6b8847a3e77ef14fe3db7fcafe0cbd10e8e826e03436d646aaef87b2e247d4af1e',
    gy: '0x8abe1d7520f9c2a45cb1eb8e95cfd55262b70b29feec5864e19c054ff99129280e4646217791811142820341263c5315',
  },
  brainpoolP512r1: {
    p: '0xaadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca703308717d4d9b009bc66842aecda12ae6a380e62881ff2f2d82c68528aa6056583a48f3',
    a: '0x7830a3318b603b89e2327145ac234cc594cbdd8d3df91610a83441caea9863bc2ded5d5aa8253aa10a2ef1c98b9ac8b57f1117a72bf2c7b9e7c1ac4d77fc94ca',
    b: '0x3df91610a83441caea9863bc2ded5d5aa8253aa10a2ef1c98b9ac8b57f1117a72bf2c7b9e7c1ac4d77fc94cadc083e67984050b75ebae5dd2809bd638016f723',
    n: '0xaadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca70330870553e5c414ca92619418661197fac10471db1d381085ddaddb58796829ca90069',
    gx: '0x81aee4bdd82ed9645a21322e9c4c6a9385ed9f70b5d916c1b43b62eef4d0098eff3b1f78e2d0d48d50d1687b93b97d5f7c6d5047406a5e688b352209bcb9f822',
    gy: '0x7dde385d566332ecc0eabfa9cf7822fdf209f70024a57b1aa000c55b881f8111b2dcde494a5f485e5bca4bd88a2763aed1ca2b2fa8f0540678cd1e0f3ad80892',
  },
}

// t1 curves share the same P/N as their r1 twins, but B / G differ and A=−3.
const t1: Record<string, Omit<BrainParams, 'a'>> = {
  brainpoolP160t1: {
    p: r1.brainpoolP160r1.p,
    b: '0x7a556b6dae535b7b51ed2c4d7daa7a0b5c55f380',
    n: r1.brainpoolP160r1.n,
    gx: '0xb199b13b9b34efc1397e64baeb05acc265ff2378',
    gy: '0xadd6718b7c7c1961f0991b842443772152c9e0ad',
  },
  brainpoolP192t1: {
    p: r1.brainpoolP192r1.p,
    b: '0x13d56ffaec78681e68f9deb43b35bec2fb68542e27897b79',
    n: r1.brainpoolP192r1.n,
    gx: '0x3ae9e58c82f63c30282e1fe7bbf43fa72c446af6f4618129',
    gy: '0x97e2c5667c2223a902ab5ca449d0084b7e5b3de7ccc01c9',
  },
  brainpoolP224t1: {
    p: r1.brainpoolP224r1.p,
    b: '0x4b337d934104cd7bef271bf60ced1ed20da14c08b3bb64f18a60888d',
    n: r1.brainpoolP224r1.n,
    gx: '0x6ab1e344ce25ff3896424e7ffe14762ecb49f8928ac0c76029b4d580',
    gy: '0x374e9f5143e568cd23f3f4d7c0d4b1e41c8cc0d1c6abd5f1a46db4c',
  },
  brainpoolP256t1: {
    p: r1.brainpoolP256r1.p,
    b: '0x662c61c430d84ea4fe66a7733d0b76b7bf93ebc4af2f49256ae58101fee92b04',
    n: r1.brainpoolP256r1.n,
    gx: '0xa3e8eb3cc1cfe7b7732213b23a656149afa142c47aafbc2b79a191562e1305f4',
    gy: '0x2d996c823439c56d7f7b22e14644417e69bcb6de39d027001dabe8f35b25c9be',
  },
  brainpoolP320t1: {
    p: r1.brainpoolP320r1.p,
    b: '0xa7f561e038eb1ed560b3d147db782013064c19f27ed27c6780aaf77fb8a547ceb5b4fef422340353',
    n: r1.brainpoolP320r1.n,
    gx: '0x925be9fb01afc6fb4d3e7d4990010f813408ab106c4f09cb7ee07868cc136fff3357f624a21bed52',
    gy: '0x63ba3a7a27483ebf6671dbef7abb30ebee084e58a0b077ad42a5a0989d1ee71b1b9bc0455fb0d2c3',
  },
  brainpoolP384t1: {
    p: r1.brainpoolP384r1.p,
    b: '0x7f519eada7bda81bd826dba647910f8c4b9346ed8ccdc64e4b1abd11756dce1d2074aa263b88805ced70355a33b471ee',
    n: r1.brainpoolP384r1.n,
    gx: '0x18de98b02db9a306f2afcd7235f72a819b80ab12ebd653172476fecd462aabffc4ff191b946a5f54d8d0aa2f418808cc',
    gy: '0x25ab056962d30651a114afd2755ad336747f93475b7a1fca3b88f2b6a208ccfe469408584dc2b2912675bf5b9e582928',
  },
  brainpoolP512t1: {
    p: r1.brainpoolP512r1.p,
    b: '0x7cbbbcf9441cfab76e1890e46884eae321f70c0bcb4981527897504bec3e36a62bcdfa2304976540f6450085f2dae145c22553b465763689180ea2571867423e',
    n: r1.brainpoolP512r1.n,
    gx: '0x640ece5c12788717b9c1ba06cbc2a6feba85842458c56dde9db1758d39c0313d82ba51735cdb3ea499aa77a7d6943a64f7a3f25fe26f06b51baa2696fa9035da',
    gy: '0x5b534bd595f5af0fa2c892376c84ace1bb4e3019b71634c01131159cae03cee9d9932184beef216bd71df2dadf86a627306ecff96dbb8bace198b61e00f8b332',
  },
}

/****************************************************************************************
 * Curve instances                                                                      *
 ****************************************************************************************/

// The actual noble‑curve objects live here.
const CURVES: Record<string, ReturnType<typeof weierstrass>> = {}

for (const [name, p] of Object.entries(r1)) {
  CURVES[name] = mkBrainpool(name, p.p, p.a!, p.b, p.n, p.gx, p.gy)
}

for (const [name, p] of Object.entries(t1)) {
  CURVES[name] = mkT1(name, p.p, p.b, p.n, p.gx, p.gy)
}

/****************************************************************************************
 * Public API                                                                           *
 ****************************************************************************************/

export type BrainpoolName = keyof typeof CURVES

export const brainpool = {
  /** Retrieve a curve by its exact RFC‑5639 name (e.g. "brainpoolP256r1"). */
  get(name: BrainpoolName) {
    if (!CURVES[name]) throw new Error(`Unknown Brainpool curve: ${name}`)
    return CURVES[name]
  },
  /** Convenience: list of every curve we expose. */
  names: Object.freeze(Object.keys(CURVES)) as BrainpoolName[],
  /** Quick check whether an arbitrary string is a Brainpool curve we know. */
  has(name: string): name is BrainpoolName {
    return !!CURVES[name as BrainpoolName]
  },
}

// Re‑export individual curves (usable as e.g. `import { P256r1 } from './brainpool'`).
export const P160r1 = CURVES.brainpoolP160r1
export const P192r1 = CURVES.brainpoolP192r1
export const P224r1 = CURVES.brainpoolP224r1
export const P256r1 = CURVES.brainpoolP256r1
export const P320r1 = CURVES.brainpoolP320r1
export const P384r1 = CURVES.brainpoolP384r1
export const P512r1 = CURVES.brainpoolP512r1

export const P160t1 = CURVES.brainpoolP160t1
export const P192t1 = CURVES.brainpoolP192t1
export const P224t1 = CURVES.brainpoolP224t1
export const P256t1 = CURVES.brainpoolP256t1
export const P320t1 = CURVES.brainpoolP320t1
export const P384t1 = CURVES.brainpoolP384t1
export const P512t1 = CURVES.brainpoolP512t1
