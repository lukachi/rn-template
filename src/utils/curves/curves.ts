import { createCurve } from '@noble/curves/_shortw_utils'
import { Field } from '@noble/curves/abstract/modular'
import { sha224, sha256 } from '@noble/hashes/sha2'

export enum SupportedCurves {
  SECP160R1 = 'SECP160R1',
  SECP192R1 = 'SECP192R1',
  SECP224R1 = 'SECP224R1',
  SECP256R1 = 'SECP256R1',
  SECP384R1 = 'SECP384R1',
  SECP521R1 = 'SECP521R1',
  BRAINPOOLP160R1 = 'BRAINPOOLP160R1',
  BRAINPOOLP192R1 = 'BRAINPOOLP192R1',
  BRAINPOOLP224R1 = 'BRAINPOOLP224R1',
  BRAINPOOLP256T1 = 'BRAINPOOLP256T1',
  BRAINPOOLP256R1 = 'BRAINPOOLP256R1',
  BRAINPOOLP320T1 = 'BRAINPOOLP320T1',
  BRAINPOOLP320R1 = 'BRAINPOOLP320R1',
  BRAINPOOLP384T1 = 'BRAINPOOLP384T1',
  BRAINPOOLP384R1 = 'BRAINPOOLP384R1',
  BRAINPOOLP512T1 = 'BRAINPOOLP512T1',
  BRAINPOOLP512R1 = 'BRAINPOOLP512R1',
}

// NIST secp192r1 aka p192
// https://www.secg.org/sec2-v2.pdf
export const secp192r1 = createCurve(
  {
    a: BigInt('0xfffffffffffffffffffffffffffffffefffffffffffffffc'),
    b: BigInt('0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1'),
    Fp: Field(BigInt('0xfffffffffffffffffffffffffffffffeffffffffffffffff')),
    n: BigInt('0xffffffffffffffffffffffff99def836146bc9b1b4d22831'),
    Gx: BigInt('0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012'),
    Gy: BigInt('0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811'),
    h: BigInt(1),
    lowS: false,
  },
  sha256,
)

export const secp224r1 = createCurve(
  {
    a: BigInt('0xfffffffffffffffffffffffffffffffefffffffffffffffffffffffe'),
    b: BigInt('0xb4050a850c04b3abf54132565044b0b7d7bfd8ba270b39432355ffb4'),
    Fp: Field(BigInt('0xffffffffffffffffffffffffffffffff000000000000000000000001')),
    n: BigInt('0xffffffffffffffffffffffffffff16a2e0b8f03e13dd29455c5c2a3d'),
    Gx: BigInt('0xb70e0cbd6bb4bf7f321390b94a03c1d356c21122343280d6115c1d21'),
    Gy: BigInt('0xbd376388b5f723fb4c22dfe6cd4375a05a07476444d5819985007e34'),
    h: BigInt(1),
    lowS: false,
  },
  sha224,
)

// TODO: check for hmac instead of sha256 for brainpool curves

export const brainpoolP256t1 = createCurve(
  {
    Fp: Field(BigInt('0x00a9fb57dba1eea9bc3e660a909d838d726e3bf623d52620282013481d1f6e5377')),
    n: BigInt('0x00a9fb57dba1eea9bc3e660a909d838d718c397aa3b561a6f7901e0e82974856a7'),
    a: BigInt('0x00a9fb57dba1eea9bc3e660a909d838d726e3bf623d52620282013481d1f6e5374'),
    b: BigInt('0x662c61c430d84ea4fe66a7733d0b76b7bf93ebc4af2f49256ae58101fee92b04'),
    Gx: BigInt('0x00a3e8eb3cc1cfe7b7732213b23a656149afa142c47aafbc2b79a191562e1305f4'),
    Gy: BigInt('0x2d996c823439c56d7f7b22e14644417e69bcb6de39d027001dabe8f35b25c9be'),
    h: 1n,
  },
  sha256,
)

export const brainpoolP256r1 = createCurve(
  {
    Fp: Field(BigInt('0x00a9fb57dba1eea9bc3e660a909d838d726e3bf623d52620282013481d1f6e5377')),
    n: BigInt('0x00a9fb57dba1eea9bc3e660a909d838d718c397aa3b561a6f7901e0e82974856a7'),
    a: BigInt('0x7d5a0975fc2c3057eef67530417affe7fb8055c126dc5c6ce94a4b44f330b5d9'),
    b: BigInt('0x26dc5c6ce94a4b44f330b5d9bbd77cbf958416295cf7e1ce6bccdc18ff8c07b6'),
    Gx: BigInt('0x008bd2aeb9cb7e57cb2c4b482ffc81b7afb9de27e1e3bd23c23a4453bd9ace3262'),
    Gy: BigInt('0x547ef835c3dac4fd97f8461a14611dc9c27745132ded8e545c1d54c72f046997'),
    h: 1n,
  },
  sha256,
)

export const brainpoolP320t1 = createCurve(
  {
    Fp: Field(
      BigInt(
        '0x00d35e472036bc4fb7e13c785ed201e065f98fcfa6f6f40def4f92b9ec7893ec28fcd412b1f1b32e27',
      ),
    ),
    n: BigInt(
      '0x00d35e472036bc4fb7e13c785ed201e065f98fcfa5b68f12a32d482ec7ee8658e98691555b44c59311',
    ),
    a: BigInt(
      '0x00d35e472036bc4fb7e13c785ed201e065f98fcfa6f6f40def4f92b9ec7893ec28fcd412b1f1b32e24',
    ),
    b: BigInt(
      '0x00a7f561e038eb1ed560b3d147db782013064c19f27ed27c6780aaf77fb8a547ceb5b4fef422340353',
    ),
    Gx: BigInt(
      '0x00925be9fb01afc6fb4d3e7d4990010f813408ab106c4f09cb7ee07868cc136fff3357f624a21bed52',
    ),
    Gy: BigInt(
      '0x63ba3a7a27483ebf6671dbef7abb30ebee084e58a0b077ad42a5a0989d1ee71b1b9bc0455fb0d2c3',
    ),
    h: 1n,
  },
  sha256,
)

export const brainpoolP320r1 = createCurve(
  {
    Fp: Field(
      BigInt(
        '0x00d35e472036bc4fb7e13c785ed201e065f98fcfa6f6f40def4f92b9ec7893ec28fcd412b1f1b32e27',
      ),
    ),
    n: BigInt(
      '0x00d35e472036bc4fb7e13c785ed201e065f98fcfa5b68f12a32d482ec7ee8658e98691555b44c59311',
    ),
    a: BigInt('0x3ee30b568fbab0f883ccebd46d3f3bb8a2a73513f5eb79da66190eb085ffa9f492f375a97d860eb4'),
    b: BigInt('0x520883949dfdbc42d3ad198640688a6fe13f41349554b49acc31dccd884539816f5eb4ac8fb1f1a6'),
    Gx: BigInt(
      '0x43bd7e9afb53d8b85289bcc48ee5bfe6f20137d10a087eb6e7871e2a10a599c710af8d0d39e20611',
    ),
    Gy: BigInt(
      '0x14fdd05545ec1cc8ab4093247f77275e0743ffed117182eaa9c77877aaac6ac7d35245d1692e8ee1',
    ),
    h: 1n,
  },
  sha256,
)

export const brainpoolP384t1 = createCurve(
  {
    Fp: Field(
      BigInt(
        '0x008cb91e82a3386d280f5d6f7e50e641df152f7109ed5456b412b1da197fb71123acd3a729901d1a71874700133107ec53',
      ),
    ),
    n: BigInt(
      '0x008cb91e82a3386d280f5d6f7e50e641df152f7109ed5456b31f166e6cac0425a7cf3ab6af6b7fc3103b883202e9046565',
    ),
    a: BigInt(
      '0x008cb91e82a3386d280f5d6f7e50e641df152f7109ed5456b412b1da197fb71123acd3a729901d1a71874700133107ec50',
    ),
    b: BigInt(
      '0x7f519eada7bda81bd826dba647910f8c4b9346ed8ccdc64e4b1abd11756dce1d2074aa263b88805ced70355a33b471ee',
    ),
    Gx: BigInt(
      '0x18de98b02db9a306f2afcd7235f72a819b80ab12ebd653172476fecd462aabffc4ff191b946a5f54d8d0aa2f418808cc',
    ),
    Gy: BigInt(
      '0x25ab056962d30651a114afd2755ad336747f93475b7a1fca3b88f2b6a208ccfe469408584dc2b2912675bf5b9e582928',
    ),
    h: 1n,
  },
  sha256,
)

export const brainpoolP384r1 = createCurve(
  {
    Fp: Field(
      BigInt(
        '0x008cb91e82a3386d280f5d6f7e50e641df152f7109ed5456b412b1da197fb71123acd3a729901d1a71874700133107ec53',
      ),
    ),
    n: BigInt(
      '0x008cb91e82a3386d280f5d6f7e50e641df152f7109ed5456b31f166e6cac0425a7cf3ab6af6b7fc3103b883202e9046565',
    ),
    a: BigInt(
      '0x7bc382c63d8c150c3c72080ace05afa0c2bea28e4fb22787139165efba91f90f8aa5814a503ad4eb04a8c7dd22ce2826',
    ),
    b: BigInt(
      '0x04a8c7dd22ce28268b39b55416f0447c2fb77de107dcd2a62e880ea53eeb62d57cb4390295dbc9943ab78696fa504c11',
    ),
    Gx: BigInt(
      '0x1d1c64f068cf45ffa2a63a81b7c13f6b8847a3e77ef14fe3db7fcafe0cbd10e8e826e03436d646aaef87b2e247d4af1e',
    ),
    Gy: BigInt(
      '0x008abe1d7520f9c2a45cb1eb8e95cfd55262b70b29feec5864e19c054ff99129280e4646217791811142820341263c5315',
    ),
    h: 1n,
  },
  sha256,
)

export const brainpoolP512t1 = createCurve(
  {
    Fp: Field(
      BigInt(
        '0x00aadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca703308717d4d9b009bc66842aecda12ae6a380e62881ff2f2d82c68528aa6056583a48f3',
      ),
    ),
    n: BigInt(
      '0x00aadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca70330870553e5c414ca92619418661197fac10471db1d381085ddaddb58796829ca90069',
    ),
    a: BigInt(
      '0x00aadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca703308717d4d9b009bc66842aecda12ae6a380e62881ff2f2d82c68528aa6056583a48f0',
    ),
    b: BigInt(
      '0x7cbbbcf9441cfab76e1890e46884eae321f70c0bcb4981527897504bec3e36a62bcdfa2304976540f6450085f2dae145c22553b465763689180ea2571867423e',
    ),
    Gx: BigInt(
      '0x640ece5c12788717b9c1ba06cbc2a6feba85842458c56dde9db1758d39c0313d82ba51735cdb3ea499aa77a7d6943a64f7a3f25fe26f06b51baa2696fa9035da',
    ),
    Gy: BigInt(
      '0x5b534bd595f5af0fa2c892376c84ace1bb4e3019b71634c01131159cae03cee9d9932184beef216bd71df2dadf86a627306ecff96dbb8bace198b61e00f8b332',
    ),
    h: 1n,
  },
  sha256,
)

export const brainpoolP512r1 = createCurve(
  {
    Fp: Field(
      BigInt(
        '0x00aadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca703308717d4d9b009bc66842aecda12ae6a380e62881ff2f2d82c68528aa6056583a48f3',
      ),
    ),
    n: BigInt(
      '0x00aadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca70330870553e5c414ca92619418661197fac10471db1d381085ddaddb58796829ca90069',
    ),
    a: BigInt(
      '0x7830a3318b603b89e2327145ac234cc594cbdd8d3df91610a83441caea9863bc2ded5d5aa8253aa10a2ef1c98b9ac8b57f1117a72bf2c7b9e7c1ac4d77fc94ca',
    ),
    b: BigInt(
      '0x3df91610a83441caea9863bc2ded5d5aa8253aa10a2ef1c98b9ac8b57f1117a72bf2c7b9e7c1ac4d77fc94cadc083e67984050b75ebae5dd2809bd638016f723',
    ),
    Gx: BigInt(
      '0x0081aee4bdd82ed9645a21322e9c4c6a9385ed9f70b5d916c1b43b62eef4d0098eff3b1f78e2d0d48d50d1687b93b97d5f7c6d5047406a5e688b352209bcb9f822',
    ),
    Gy: BigInt(
      '0x7dde385d566332ecc0eabfa9cf7822fdf209f70024a57b1aa000c55b881f8111b2dcde494a5f485e5bca4bd88a2763aed1ca2b2fa8f0540678cd1e0f3ad80892',
    ),
    h: 1n,
  },
  sha256,
)
