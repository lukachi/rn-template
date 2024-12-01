/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers'
import type { StateKeeper, StateKeeperInterface } from '../StateKeeper'

const _abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'AdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'beacon',
        type: 'address',
      },
    ],
    name: 'BeaconUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'passportKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'identityKey',
        type: 'bytes32',
      },
    ],
    name: 'BondAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'passportKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'identityKey',
        type: 'bytes32',
      },
    ],
    name: 'BondIdentityReissued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'passportKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'identityKey',
        type: 'bytes32',
      },
    ],
    name: 'BondRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'certificateKey',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'expirationTimestamp',
        type: 'uint256',
      },
    ],
    name: 'CertificateAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'certificateKey',
        type: 'bytes32',
      },
    ],
    name: 'CertificateRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    inputs: [],
    name: 'ICAO_PREFIX',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAGIC_ID',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'P',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REVOKED',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'USED',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'signer_',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'chainName_',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'registrationSmt_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'certificatesSmt_',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'icaoMasterTreeMerkleRoot_',
        type: 'bytes32',
      },
    ],
    name: '__StateKeeper_init',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'passportKey_',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'passportHash_',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'identityKey_',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'dgCommit_',
        type: 'uint256',
      },
    ],
    name: 'addBond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'certificateKey_',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'expirationTimestamp_',
        type: 'uint256',
      },
    ],
    name: 'addCertificate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'certificatesSmt',
    outputs: [
      {
        internalType: 'contract PoseidonSMT',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'chainName',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'newRoot_',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'proof_',
        type: 'bytes',
      },
    ],
    name: 'changeICAOMasterTreeRoot',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'newSignerPubKey_',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'signature_',
        type: 'bytes',
      },
    ],
    name: 'changeSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'certificateKey_',
        type: 'bytes32',
      },
    ],
    name: 'getCertificateInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint64',
            name: 'expirationTimestamp',
            type: 'uint64',
          },
        ],
        internalType: 'struct StateKeeper.CertificateInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'methodId_',
        type: 'uint8',
      },
    ],
    name: 'getNonce',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'passportKey_',
        type: 'bytes32',
      },
    ],
    name: 'getPassportInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'activeIdentity',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'identityReissueCounter',
            type: 'uint64',
          },
        ],
        internalType: 'struct StateKeeper.PassportInfo',
        name: 'passportInfo_',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'activePassport',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'issueTimestamp',
            type: 'uint64',
          },
        ],
        internalType: 'struct StateKeeper.IdentityInfo',
        name: 'identityInfo_',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'key_',
        type: 'string',
      },
    ],
    name: 'getRegistrationByKey',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRegistrations',
    outputs: [
      {
        internalType: 'string[]',
        name: 'keys_',
        type: 'string[]',
      },
      {
        internalType: 'address[]',
        name: 'values_',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'icaoMasterTreeMerkleRoot',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'registration_',
        type: 'address',
      },
    ],
    name: 'isRegistration',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'registrationSmt',
    outputs: [
      {
        internalType: 'contract PoseidonSMT',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'passportKey_',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'identityKey_',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'dgCommit_',
        type: 'uint256',
      },
    ],
    name: 'reissueBondIdentity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'certificateKey_',
        type: 'bytes32',
      },
    ],
    name: 'removeCertificate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'passportKey_',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'identityKey_',
        type: 'bytes32',
      },
    ],
    name: 'revokeBond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'signer',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum StateKeeper.MethodId',
        name: 'methodId_',
        type: 'uint8',
      },
      {
        internalType: 'bytes',
        name: 'data_',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'proof_',
        type: 'bytes',
      },
    ],
    name: 'updateRegistrationSet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation_',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'proof_',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'data_',
        type: 'bytes',
      },
    ],
    name: 'upgradeToAndCallWithProof',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newImplementation_',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'proof_',
        type: 'bytes',
      },
    ],
    name: 'upgradeToWithProof',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'sigHash_',
        type: 'bytes32',
      },
    ],
    name: 'useSignature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'usedSignatures',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export class StateKeeper__factory {
  static readonly abi = _abi
  static createInterface(): StateKeeperInterface {
    return new Interface(_abi) as StateKeeperInterface
  }
  static connect(address: string, runner?: ContractRunner | null): StateKeeper {
    return new Contract(address, _abi, runner) as unknown as StateKeeper
  }
}
