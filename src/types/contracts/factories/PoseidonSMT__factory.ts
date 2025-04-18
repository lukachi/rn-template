/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers'
import type { PoseidonSMT, PoseidonSMTInterface } from '../PoseidonSMT'

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
        indexed: false,
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
    ],
    name: 'RootUpdated',
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
    name: 'ROOT_VALIDITY',
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
        name: 'stateKeeper_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'treeHeight_',
        type: 'uint256',
      },
    ],
    name: '__PoseidonSMT_init',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'keyOfElement_',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'element_',
        type: 'bytes32',
      },
    ],
    name: 'add',
    outputs: [],
    stateMutability: 'nonpayable',
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
        name: 'key_',
        type: 'bytes32',
      },
    ],
    name: 'getNodeByKey',
    outputs: [
      {
        components: [
          {
            internalType: 'enum SparseMerkleTree.NodeType',
            name: 'nodeType',
            type: 'uint8',
          },
          {
            internalType: 'uint64',
            name: 'childLeft',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'childRight',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'nodeHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'key',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'value',
            type: 'bytes32',
          },
        ],
        internalType: 'struct SparseMerkleTree.Node',
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
        name: 'key_',
        type: 'bytes32',
      },
    ],
    name: 'getProof',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32[]',
            name: 'siblings',
            type: 'bytes32[]',
          },
          {
            internalType: 'bool',
            name: 'existence',
            type: 'bool',
          },
          {
            internalType: 'bytes32',
            name: 'key',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'value',
            type: 'bytes32',
          },
          {
            internalType: 'bool',
            name: 'auxExistence',
            type: 'bool',
          },
          {
            internalType: 'bytes32',
            name: 'auxKey',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'auxValue',
            type: 'bytes32',
          },
        ],
        internalType: 'struct SparseMerkleTree.Proof',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRoot',
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
        internalType: 'bytes32',
        name: 'root_',
        type: 'bytes32',
      },
    ],
    name: 'isRootLatest',
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
    inputs: [
      {
        internalType: 'bytes32',
        name: 'root_',
        type: 'bytes32',
      },
    ],
    name: 'isRootValid',
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
    inputs: [
      {
        internalType: 'bytes32',
        name: 'keyOfElement_',
        type: 'bytes32',
      },
    ],
    name: 'remove',
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
    inputs: [],
    name: 'stateKeeper',
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
        internalType: 'bytes32',
        name: 'keyOfElement_',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'newElement_',
        type: 'bytes32',
      },
    ],
    name: 'update',
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
] as const

export class PoseidonSMT__factory {
  static readonly abi = _abi
  static createInterface(): PoseidonSMTInterface {
    return new Interface(_abi) as PoseidonSMTInterface
  }
  static connect(address: string, runner?: ContractRunner | null): PoseidonSMT {
    return new Contract(address, _abi, runner) as unknown as PoseidonSMT
  }
}
