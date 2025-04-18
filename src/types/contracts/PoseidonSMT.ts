/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from 'ethers'
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from './common'

export declare namespace SparseMerkleTree {
  export type NodeStruct = {
    nodeType: BigNumberish
    childLeft: BigNumberish
    childRight: BigNumberish
    nodeHash: BytesLike
    key: BytesLike
    value: BytesLike
  }

  export type NodeStructOutput = [
    nodeType: bigint,
    childLeft: bigint,
    childRight: bigint,
    nodeHash: string,
    key: string,
    value: string,
  ] & {
    nodeType: bigint
    childLeft: bigint
    childRight: bigint
    nodeHash: string
    key: string
    value: string
  }

  export type ProofStruct = {
    root: BytesLike
    siblings: BytesLike[]
    existence: boolean
    key: BytesLike
    value: BytesLike
    auxExistence: boolean
    auxKey: BytesLike
    auxValue: BytesLike
  }

  export type ProofStructOutput = [
    root: string,
    siblings: string[],
    existence: boolean,
    key: string,
    value: string,
    auxExistence: boolean,
    auxKey: string,
    auxValue: string,
  ] & {
    root: string
    siblings: string[]
    existence: boolean
    key: string
    value: string
    auxExistence: boolean
    auxKey: string
    auxValue: string
  }
}

export interface PoseidonSMTInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'MAGIC_ID'
      | 'P'
      | 'ROOT_VALIDITY'
      | '__PoseidonSMT_init'
      | 'add'
      | 'chainName'
      | 'changeSigner'
      | 'getNodeByKey'
      | 'getNonce'
      | 'getProof'
      | 'getRoot'
      | 'implementation'
      | 'isRootLatest'
      | 'isRootValid'
      | 'proxiableUUID'
      | 'remove'
      | 'signer'
      | 'stateKeeper'
      | 'update'
      | 'upgradeTo'
      | 'upgradeToAndCall'
      | 'upgradeToAndCallWithProof'
      | 'upgradeToWithProof',
  ): FunctionFragment

  getEvent(
    nameOrSignatureOrTopic:
      | 'AdminChanged'
      | 'BeaconUpgraded'
      | 'Initialized'
      | 'RootUpdated'
      | 'Upgraded',
  ): EventFragment

  encodeFunctionData(functionFragment: 'MAGIC_ID', values?: undefined): string
  encodeFunctionData(functionFragment: 'P', values?: undefined): string
  encodeFunctionData(functionFragment: 'ROOT_VALIDITY', values?: undefined): string
  encodeFunctionData(
    functionFragment: '__PoseidonSMT_init',
    values: [AddressLike, string, AddressLike, BigNumberish],
  ): string
  encodeFunctionData(functionFragment: 'add', values: [BytesLike, BytesLike]): string
  encodeFunctionData(functionFragment: 'chainName', values?: undefined): string
  encodeFunctionData(functionFragment: 'changeSigner', values: [BytesLike, BytesLike]): string
  encodeFunctionData(functionFragment: 'getNodeByKey', values: [BytesLike]): string
  encodeFunctionData(functionFragment: 'getNonce', values: [BigNumberish]): string
  encodeFunctionData(functionFragment: 'getProof', values: [BytesLike]): string
  encodeFunctionData(functionFragment: 'getRoot', values?: undefined): string
  encodeFunctionData(functionFragment: 'implementation', values?: undefined): string
  encodeFunctionData(functionFragment: 'isRootLatest', values: [BytesLike]): string
  encodeFunctionData(functionFragment: 'isRootValid', values: [BytesLike]): string
  encodeFunctionData(functionFragment: 'proxiableUUID', values?: undefined): string
  encodeFunctionData(functionFragment: 'remove', values: [BytesLike]): string
  encodeFunctionData(functionFragment: 'signer', values?: undefined): string
  encodeFunctionData(functionFragment: 'stateKeeper', values?: undefined): string
  encodeFunctionData(functionFragment: 'update', values: [BytesLike, BytesLike]): string
  encodeFunctionData(functionFragment: 'upgradeTo', values: [AddressLike]): string
  encodeFunctionData(functionFragment: 'upgradeToAndCall', values: [AddressLike, BytesLike]): string
  encodeFunctionData(
    functionFragment: 'upgradeToAndCallWithProof',
    values: [AddressLike, BytesLike, BytesLike],
  ): string
  encodeFunctionData(
    functionFragment: 'upgradeToWithProof',
    values: [AddressLike, BytesLike],
  ): string

  decodeFunctionResult(functionFragment: 'MAGIC_ID', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'P', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'ROOT_VALIDITY', data: BytesLike): Result
  decodeFunctionResult(functionFragment: '__PoseidonSMT_init', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'add', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'chainName', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'changeSigner', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'getNodeByKey', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'getNonce', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'getProof', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'getRoot', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'implementation', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'isRootLatest', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'isRootValid', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'proxiableUUID', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'remove', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'signer', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'stateKeeper', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'update', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'upgradeTo', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'upgradeToAndCall', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'upgradeToAndCallWithProof', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'upgradeToWithProof', data: BytesLike): Result
}

export namespace AdminChangedEvent {
  export type InputTuple = [previousAdmin: AddressLike, newAdmin: AddressLike]
  export type OutputTuple = [previousAdmin: string, newAdmin: string]
  export interface OutputObject {
    previousAdmin: string
    newAdmin: string
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>
  export type Filter = TypedDeferredTopicFilter<Event>
  export type Log = TypedEventLog<Event>
  export type LogDescription = TypedLogDescription<Event>
}

export namespace BeaconUpgradedEvent {
  export type InputTuple = [beacon: AddressLike]
  export type OutputTuple = [beacon: string]
  export interface OutputObject {
    beacon: string
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>
  export type Filter = TypedDeferredTopicFilter<Event>
  export type Log = TypedEventLog<Event>
  export type LogDescription = TypedLogDescription<Event>
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish]
  export type OutputTuple = [version: bigint]
  export interface OutputObject {
    version: bigint
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>
  export type Filter = TypedDeferredTopicFilter<Event>
  export type Log = TypedEventLog<Event>
  export type LogDescription = TypedLogDescription<Event>
}

export namespace RootUpdatedEvent {
  export type InputTuple = [root: BytesLike]
  export type OutputTuple = [root: string]
  export interface OutputObject {
    root: string
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>
  export type Filter = TypedDeferredTopicFilter<Event>
  export type Log = TypedEventLog<Event>
  export type LogDescription = TypedLogDescription<Event>
}

export namespace UpgradedEvent {
  export type InputTuple = [implementation: AddressLike]
  export type OutputTuple = [implementation: string]
  export interface OutputObject {
    implementation: string
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>
  export type Filter = TypedDeferredTopicFilter<Event>
  export type Log = TypedEventLog<Event>
  export type LogDescription = TypedLogDescription<Event>
}

export interface PoseidonSMT extends BaseContract {
  connect(runner?: ContractRunner | null): PoseidonSMT
  waitForDeployment(): Promise<this>

  interface: PoseidonSMTInterface

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>,
  ): Promise<this>
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>,
  ): Promise<this>
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent,
  ): Promise<Array<TypedListener<TCEvent>>>
  listeners(eventName?: string): Promise<Array<Listener>>
  removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>

  MAGIC_ID: TypedContractMethod<[], [bigint], 'view'>

  P: TypedContractMethod<[], [bigint], 'view'>

  ROOT_VALIDITY: TypedContractMethod<[], [bigint], 'view'>

  __PoseidonSMT_init: TypedContractMethod<
    [
      signer_: AddressLike,
      chainName_: string,
      stateKeeper_: AddressLike,
      treeHeight_: BigNumberish,
    ],
    [void],
    'nonpayable'
  >

  add: TypedContractMethod<[keyOfElement_: BytesLike, element_: BytesLike], [void], 'nonpayable'>

  chainName: TypedContractMethod<[], [string], 'view'>

  changeSigner: TypedContractMethod<
    [newSignerPubKey_: BytesLike, signature_: BytesLike],
    [void],
    'nonpayable'
  >

  getNodeByKey: TypedContractMethod<[key_: BytesLike], [SparseMerkleTree.NodeStructOutput], 'view'>

  getNonce: TypedContractMethod<[methodId_: BigNumberish], [bigint], 'view'>

  getProof: TypedContractMethod<[key_: BytesLike], [SparseMerkleTree.ProofStructOutput], 'view'>

  getRoot: TypedContractMethod<[], [string], 'view'>

  implementation: TypedContractMethod<[], [string], 'view'>

  isRootLatest: TypedContractMethod<[root_: BytesLike], [boolean], 'view'>

  isRootValid: TypedContractMethod<[root_: BytesLike], [boolean], 'view'>

  proxiableUUID: TypedContractMethod<[], [string], 'view'>

  remove: TypedContractMethod<[keyOfElement_: BytesLike], [void], 'nonpayable'>

  stateKeeper: TypedContractMethod<[], [string], 'view'>

  update: TypedContractMethod<
    [keyOfElement_: BytesLike, newElement_: BytesLike],
    [void],
    'nonpayable'
  >

  upgradeTo: TypedContractMethod<[newImplementation: AddressLike], [void], 'nonpayable'>

  upgradeToAndCall: TypedContractMethod<
    [newImplementation: AddressLike, data: BytesLike],
    [void],
    'payable'
  >

  upgradeToAndCallWithProof: TypedContractMethod<
    [newImplementation_: AddressLike, proof_: BytesLike, data_: BytesLike],
    [void],
    'nonpayable'
  >

  upgradeToWithProof: TypedContractMethod<
    [newImplementation_: AddressLike, proof_: BytesLike],
    [void],
    'nonpayable'
  >

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T

  getFunction(nameOrSignature: 'MAGIC_ID'): TypedContractMethod<[], [bigint], 'view'>
  getFunction(nameOrSignature: 'P'): TypedContractMethod<[], [bigint], 'view'>
  getFunction(nameOrSignature: 'ROOT_VALIDITY'): TypedContractMethod<[], [bigint], 'view'>
  getFunction(
    nameOrSignature: '__PoseidonSMT_init',
  ): TypedContractMethod<
    [
      signer_: AddressLike,
      chainName_: string,
      stateKeeper_: AddressLike,
      treeHeight_: BigNumberish,
    ],
    [void],
    'nonpayable'
  >
  getFunction(
    nameOrSignature: 'add',
  ): TypedContractMethod<[keyOfElement_: BytesLike, element_: BytesLike], [void], 'nonpayable'>
  getFunction(nameOrSignature: 'chainName'): TypedContractMethod<[], [string], 'view'>
  getFunction(
    nameOrSignature: 'changeSigner',
  ): TypedContractMethod<[newSignerPubKey_: BytesLike, signature_: BytesLike], [void], 'nonpayable'>
  getFunction(
    nameOrSignature: 'getNodeByKey',
  ): TypedContractMethod<[key_: BytesLike], [SparseMerkleTree.NodeStructOutput], 'view'>
  getFunction(
    nameOrSignature: 'getNonce',
  ): TypedContractMethod<[methodId_: BigNumberish], [bigint], 'view'>
  getFunction(
    nameOrSignature: 'getProof',
  ): TypedContractMethod<[key_: BytesLike], [SparseMerkleTree.ProofStructOutput], 'view'>
  getFunction(nameOrSignature: 'getRoot'): TypedContractMethod<[], [string], 'view'>
  getFunction(nameOrSignature: 'implementation'): TypedContractMethod<[], [string], 'view'>
  getFunction(
    nameOrSignature: 'isRootLatest',
  ): TypedContractMethod<[root_: BytesLike], [boolean], 'view'>
  getFunction(
    nameOrSignature: 'isRootValid',
  ): TypedContractMethod<[root_: BytesLike], [boolean], 'view'>
  getFunction(nameOrSignature: 'proxiableUUID'): TypedContractMethod<[], [string], 'view'>
  getFunction(
    nameOrSignature: 'remove',
  ): TypedContractMethod<[keyOfElement_: BytesLike], [void], 'nonpayable'>
  getFunction(nameOrSignature: 'signer'): TypedContractMethod<[], [string], 'view'>
  getFunction(nameOrSignature: 'stateKeeper'): TypedContractMethod<[], [string], 'view'>
  getFunction(
    nameOrSignature: 'update',
  ): TypedContractMethod<[keyOfElement_: BytesLike, newElement_: BytesLike], [void], 'nonpayable'>
  getFunction(
    nameOrSignature: 'upgradeTo',
  ): TypedContractMethod<[newImplementation: AddressLike], [void], 'nonpayable'>
  getFunction(
    nameOrSignature: 'upgradeToAndCall',
  ): TypedContractMethod<[newImplementation: AddressLike, data: BytesLike], [void], 'payable'>
  getFunction(
    nameOrSignature: 'upgradeToAndCallWithProof',
  ): TypedContractMethod<
    [newImplementation_: AddressLike, proof_: BytesLike, data_: BytesLike],
    [void],
    'nonpayable'
  >
  getFunction(
    nameOrSignature: 'upgradeToWithProof',
  ): TypedContractMethod<[newImplementation_: AddressLike, proof_: BytesLike], [void], 'nonpayable'>

  getEvent(
    key: 'AdminChanged',
  ): TypedContractEvent<
    AdminChangedEvent.InputTuple,
    AdminChangedEvent.OutputTuple,
    AdminChangedEvent.OutputObject
  >
  getEvent(
    key: 'BeaconUpgraded',
  ): TypedContractEvent<
    BeaconUpgradedEvent.InputTuple,
    BeaconUpgradedEvent.OutputTuple,
    BeaconUpgradedEvent.OutputObject
  >
  getEvent(
    key: 'Initialized',
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >
  getEvent(
    key: 'RootUpdated',
  ): TypedContractEvent<
    RootUpdatedEvent.InputTuple,
    RootUpdatedEvent.OutputTuple,
    RootUpdatedEvent.OutputObject
  >
  getEvent(
    key: 'Upgraded',
  ): TypedContractEvent<
    UpgradedEvent.InputTuple,
    UpgradedEvent.OutputTuple,
    UpgradedEvent.OutputObject
  >

  filters: {
    'AdminChanged(address,address)': TypedContractEvent<
      AdminChangedEvent.InputTuple,
      AdminChangedEvent.OutputTuple,
      AdminChangedEvent.OutputObject
    >
    AdminChanged: TypedContractEvent<
      AdminChangedEvent.InputTuple,
      AdminChangedEvent.OutputTuple,
      AdminChangedEvent.OutputObject
    >

    'BeaconUpgraded(address)': TypedContractEvent<
      BeaconUpgradedEvent.InputTuple,
      BeaconUpgradedEvent.OutputTuple,
      BeaconUpgradedEvent.OutputObject
    >
    BeaconUpgraded: TypedContractEvent<
      BeaconUpgradedEvent.InputTuple,
      BeaconUpgradedEvent.OutputTuple,
      BeaconUpgradedEvent.OutputObject
    >

    'Initialized(uint8)': TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >

    'RootUpdated(bytes32)': TypedContractEvent<
      RootUpdatedEvent.InputTuple,
      RootUpdatedEvent.OutputTuple,
      RootUpdatedEvent.OutputObject
    >
    RootUpdated: TypedContractEvent<
      RootUpdatedEvent.InputTuple,
      RootUpdatedEvent.OutputTuple,
      RootUpdatedEvent.OutputObject
    >

    'Upgraded(address)': TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >
    Upgraded: TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >
  }
}
