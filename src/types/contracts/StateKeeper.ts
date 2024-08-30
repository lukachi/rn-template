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
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export declare namespace StateKeeper {
  export type CertificateInfoStruct = { expirationTimestamp: BigNumberish };

  export type CertificateInfoStructOutput = [expirationTimestamp: bigint] & {
    expirationTimestamp: bigint;
  };

  export type PassportInfoStruct = {
    activeIdentity: BytesLike;
    identityReissueCounter: BigNumberish;
  };

  export type PassportInfoStructOutput = [
    activeIdentity: string,
    identityReissueCounter: bigint
  ] & { activeIdentity: string; identityReissueCounter: bigint };

  export type IdentityInfoStruct = {
    activePassport: BytesLike;
    issueTimestamp: BigNumberish;
  };

  export type IdentityInfoStructOutput = [
    activePassport: string,
    issueTimestamp: bigint
  ] & { activePassport: string; issueTimestamp: bigint };
}

export interface StateKeeperInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "ICAO_PREFIX"
      | "MAGIC_ID"
      | "P"
      | "REVOKED"
      | "USED"
      | "__StateKeeper_init"
      | "addBond"
      | "addCertificate"
      | "certificatesSmt"
      | "chainName"
      | "changeICAOMasterTreeRoot"
      | "changeSigner"
      | "getCertificateInfo"
      | "getNonce"
      | "getPassportInfo"
      | "getRegistrationByKey"
      | "getRegistrations"
      | "icaoMasterTreeMerkleRoot"
      | "implementation"
      | "isRegistration"
      | "proxiableUUID"
      | "registrationSmt"
      | "reissueBondIdentity"
      | "removeCertificate"
      | "revokeBond"
      | "signer"
      | "updateRegistrationSet"
      | "upgradeTo"
      | "upgradeToAndCall"
      | "upgradeToAndCallWithProof"
      | "upgradeToWithProof"
      | "useSignature"
      | "usedSignatures"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "AdminChanged"
      | "BeaconUpgraded"
      | "BondAdded"
      | "BondIdentityReissued"
      | "BondRevoked"
      | "CertificateAdded"
      | "CertificateRemoved"
      | "Initialized"
      | "Upgraded"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "ICAO_PREFIX",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "MAGIC_ID", values?: undefined): string;
  encodeFunctionData(functionFragment: "P", values?: undefined): string;
  encodeFunctionData(functionFragment: "REVOKED", values?: undefined): string;
  encodeFunctionData(functionFragment: "USED", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "__StateKeeper_init",
    values: [AddressLike, string, AddressLike, AddressLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "addBond",
    values: [BytesLike, BytesLike, BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "addCertificate",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "certificatesSmt",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "chainName", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "changeICAOMasterTreeRoot",
    values: [BytesLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "changeSigner",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getCertificateInfo",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getNonce",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getPassportInfo",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getRegistrationByKey",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getRegistrations",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "icaoMasterTreeMerkleRoot",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "implementation",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isRegistration",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "proxiableUUID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "registrationSmt",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "reissueBondIdentity",
    values: [BytesLike, BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "removeCertificate",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeBond",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "signer", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "updateRegistrationSet",
    values: [BigNumberish, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeTo",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [AddressLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCallWithProof",
    values: [AddressLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeToWithProof",
    values: [AddressLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "useSignature",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "usedSignatures",
    values: [BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "ICAO_PREFIX",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "MAGIC_ID", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "P", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "REVOKED", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "USED", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "__StateKeeper_init",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "addBond", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "addCertificate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "certificatesSmt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "chainName", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "changeICAOMasterTreeRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "changeSigner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCertificateInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getNonce", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPassportInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRegistrationByKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRegistrations",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "icaoMasterTreeMerkleRoot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "implementation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isRegistration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "proxiableUUID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registrationSmt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "reissueBondIdentity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeCertificate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeBond", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "signer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "updateRegistrationSet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "upgradeTo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCall",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCallWithProof",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToWithProof",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "useSignature",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "usedSignatures",
    data: BytesLike
  ): Result;
}

export namespace AdminChangedEvent {
  export type InputTuple = [previousAdmin: AddressLike, newAdmin: AddressLike];
  export type OutputTuple = [previousAdmin: string, newAdmin: string];
  export interface OutputObject {
    previousAdmin: string;
    newAdmin: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BeaconUpgradedEvent {
  export type InputTuple = [beacon: AddressLike];
  export type OutputTuple = [beacon: string];
  export interface OutputObject {
    beacon: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BondAddedEvent {
  export type InputTuple = [passportKey: BytesLike, identityKey: BytesLike];
  export type OutputTuple = [passportKey: string, identityKey: string];
  export interface OutputObject {
    passportKey: string;
    identityKey: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BondIdentityReissuedEvent {
  export type InputTuple = [passportKey: BytesLike, identityKey: BytesLike];
  export type OutputTuple = [passportKey: string, identityKey: string];
  export interface OutputObject {
    passportKey: string;
    identityKey: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BondRevokedEvent {
  export type InputTuple = [passportKey: BytesLike, identityKey: BytesLike];
  export type OutputTuple = [passportKey: string, identityKey: string];
  export interface OutputObject {
    passportKey: string;
    identityKey: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace CertificateAddedEvent {
  export type InputTuple = [
    certificateKey: BytesLike,
    expirationTimestamp: BigNumberish
  ];
  export type OutputTuple = [
    certificateKey: string,
    expirationTimestamp: bigint
  ];
  export interface OutputObject {
    certificateKey: string;
    expirationTimestamp: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace CertificateRemovedEvent {
  export type InputTuple = [certificateKey: BytesLike];
  export type OutputTuple = [certificateKey: string];
  export interface OutputObject {
    certificateKey: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpgradedEvent {
  export type InputTuple = [implementation: AddressLike];
  export type OutputTuple = [implementation: string];
  export interface OutputObject {
    implementation: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface StateKeeper extends BaseContract {
  connect(runner?: ContractRunner | null): StateKeeper;
  waitForDeployment(): Promise<this>;

  interface: StateKeeperInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  ICAO_PREFIX: TypedContractMethod<[], [string], "view">;

  MAGIC_ID: TypedContractMethod<[], [bigint], "view">;

  P: TypedContractMethod<[], [bigint], "view">;

  REVOKED: TypedContractMethod<[], [string], "view">;

  USED: TypedContractMethod<[], [string], "view">;

  __StateKeeper_init: TypedContractMethod<
    [
      signer_: AddressLike,
      chainName_: string,
      registrationSmt_: AddressLike,
      certificatesSmt_: AddressLike,
      icaoMasterTreeMerkleRoot_: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  addBond: TypedContractMethod<
    [
      passportKey_: BytesLike,
      passportHash_: BytesLike,
      identityKey_: BytesLike,
      dgCommit_: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  addCertificate: TypedContractMethod<
    [certificateKey_: BytesLike, expirationTimestamp_: BigNumberish],
    [void],
    "nonpayable"
  >;

  certificatesSmt: TypedContractMethod<[], [string], "view">;

  chainName: TypedContractMethod<[], [string], "view">;

  changeICAOMasterTreeRoot: TypedContractMethod<
    [newRoot_: BytesLike, timestamp: BigNumberish, proof_: BytesLike],
    [void],
    "nonpayable"
  >;

  changeSigner: TypedContractMethod<
    [newSignerPubKey_: BytesLike, signature_: BytesLike],
    [void],
    "nonpayable"
  >;

  getCertificateInfo: TypedContractMethod<
    [certificateKey_: BytesLike],
    [StateKeeper.CertificateInfoStructOutput],
    "view"
  >;

  getNonce: TypedContractMethod<[methodId_: BigNumberish], [bigint], "view">;

  getPassportInfo: TypedContractMethod<
    [passportKey_: BytesLike],
    [
      [
        StateKeeper.PassportInfoStructOutput,
        StateKeeper.IdentityInfoStructOutput
      ] & {
        passportInfo_: StateKeeper.PassportInfoStructOutput;
        identityInfo_: StateKeeper.IdentityInfoStructOutput;
      }
    ],
    "view"
  >;

  getRegistrationByKey: TypedContractMethod<[key_: string], [string], "view">;

  getRegistrations: TypedContractMethod<
    [],
    [[string[], string[]] & { keys_: string[]; values_: string[] }],
    "view"
  >;

  icaoMasterTreeMerkleRoot: TypedContractMethod<[], [string], "view">;

  implementation: TypedContractMethod<[], [string], "view">;

  isRegistration: TypedContractMethod<
    [registration_: AddressLike],
    [boolean],
    "view"
  >;

  proxiableUUID: TypedContractMethod<[], [string], "view">;

  registrationSmt: TypedContractMethod<[], [string], "view">;

  reissueBondIdentity: TypedContractMethod<
    [passportKey_: BytesLike, identityKey_: BytesLike, dgCommit_: BigNumberish],
    [void],
    "nonpayable"
  >;

  removeCertificate: TypedContractMethod<
    [certificateKey_: BytesLike],
    [void],
    "nonpayable"
  >;

  revokeBond: TypedContractMethod<
    [passportKey_: BytesLike, identityKey_: BytesLike],
    [void],
    "nonpayable"
  >;

  updateRegistrationSet: TypedContractMethod<
    [methodId_: BigNumberish, data_: BytesLike, proof_: BytesLike],
    [void],
    "nonpayable"
  >;

  upgradeTo: TypedContractMethod<
    [newImplementation: AddressLike],
    [void],
    "nonpayable"
  >;

  upgradeToAndCall: TypedContractMethod<
    [newImplementation: AddressLike, data: BytesLike],
    [void],
    "payable"
  >;

  upgradeToAndCallWithProof: TypedContractMethod<
    [newImplementation_: AddressLike, proof_: BytesLike, data_: BytesLike],
    [void],
    "nonpayable"
  >;

  upgradeToWithProof: TypedContractMethod<
    [newImplementation_: AddressLike, proof_: BytesLike],
    [void],
    "nonpayable"
  >;

  useSignature: TypedContractMethod<
    [sigHash_: BytesLike],
    [void],
    "nonpayable"
  >;

  usedSignatures: TypedContractMethod<[arg0: BytesLike], [boolean], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "ICAO_PREFIX"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "MAGIC_ID"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(nameOrSignature: "P"): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "REVOKED"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "USED"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "__StateKeeper_init"
  ): TypedContractMethod<
    [
      signer_: AddressLike,
      chainName_: string,
      registrationSmt_: AddressLike,
      certificatesSmt_: AddressLike,
      icaoMasterTreeMerkleRoot_: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "addBond"
  ): TypedContractMethod<
    [
      passportKey_: BytesLike,
      passportHash_: BytesLike,
      identityKey_: BytesLike,
      dgCommit_: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "addCertificate"
  ): TypedContractMethod<
    [certificateKey_: BytesLike, expirationTimestamp_: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "certificatesSmt"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "chainName"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "changeICAOMasterTreeRoot"
  ): TypedContractMethod<
    [newRoot_: BytesLike, timestamp: BigNumberish, proof_: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "changeSigner"
  ): TypedContractMethod<
    [newSignerPubKey_: BytesLike, signature_: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getCertificateInfo"
  ): TypedContractMethod<
    [certificateKey_: BytesLike],
    [StateKeeper.CertificateInfoStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "getNonce"
  ): TypedContractMethod<[methodId_: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "getPassportInfo"
  ): TypedContractMethod<
    [passportKey_: BytesLike],
    [
      [
        StateKeeper.PassportInfoStructOutput,
        StateKeeper.IdentityInfoStructOutput
      ] & {
        passportInfo_: StateKeeper.PassportInfoStructOutput;
        identityInfo_: StateKeeper.IdentityInfoStructOutput;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getRegistrationByKey"
  ): TypedContractMethod<[key_: string], [string], "view">;
  getFunction(
    nameOrSignature: "getRegistrations"
  ): TypedContractMethod<
    [],
    [[string[], string[]] & { keys_: string[]; values_: string[] }],
    "view"
  >;
  getFunction(
    nameOrSignature: "icaoMasterTreeMerkleRoot"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "implementation"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "isRegistration"
  ): TypedContractMethod<[registration_: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "proxiableUUID"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "registrationSmt"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "reissueBondIdentity"
  ): TypedContractMethod<
    [passportKey_: BytesLike, identityKey_: BytesLike, dgCommit_: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "removeCertificate"
  ): TypedContractMethod<[certificateKey_: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "revokeBond"
  ): TypedContractMethod<
    [passportKey_: BytesLike, identityKey_: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "signer"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "updateRegistrationSet"
  ): TypedContractMethod<
    [methodId_: BigNumberish, data_: BytesLike, proof_: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "upgradeTo"
  ): TypedContractMethod<
    [newImplementation: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "upgradeToAndCall"
  ): TypedContractMethod<
    [newImplementation: AddressLike, data: BytesLike],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "upgradeToAndCallWithProof"
  ): TypedContractMethod<
    [newImplementation_: AddressLike, proof_: BytesLike, data_: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "upgradeToWithProof"
  ): TypedContractMethod<
    [newImplementation_: AddressLike, proof_: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "useSignature"
  ): TypedContractMethod<[sigHash_: BytesLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "usedSignatures"
  ): TypedContractMethod<[arg0: BytesLike], [boolean], "view">;

  getEvent(
    key: "AdminChanged"
  ): TypedContractEvent<
    AdminChangedEvent.InputTuple,
    AdminChangedEvent.OutputTuple,
    AdminChangedEvent.OutputObject
  >;
  getEvent(
    key: "BeaconUpgraded"
  ): TypedContractEvent<
    BeaconUpgradedEvent.InputTuple,
    BeaconUpgradedEvent.OutputTuple,
    BeaconUpgradedEvent.OutputObject
  >;
  getEvent(
    key: "BondAdded"
  ): TypedContractEvent<
    BondAddedEvent.InputTuple,
    BondAddedEvent.OutputTuple,
    BondAddedEvent.OutputObject
  >;
  getEvent(
    key: "BondIdentityReissued"
  ): TypedContractEvent<
    BondIdentityReissuedEvent.InputTuple,
    BondIdentityReissuedEvent.OutputTuple,
    BondIdentityReissuedEvent.OutputObject
  >;
  getEvent(
    key: "BondRevoked"
  ): TypedContractEvent<
    BondRevokedEvent.InputTuple,
    BondRevokedEvent.OutputTuple,
    BondRevokedEvent.OutputObject
  >;
  getEvent(
    key: "CertificateAdded"
  ): TypedContractEvent<
    CertificateAddedEvent.InputTuple,
    CertificateAddedEvent.OutputTuple,
    CertificateAddedEvent.OutputObject
  >;
  getEvent(
    key: "CertificateRemoved"
  ): TypedContractEvent<
    CertificateRemovedEvent.InputTuple,
    CertificateRemovedEvent.OutputTuple,
    CertificateRemovedEvent.OutputObject
  >;
  getEvent(
    key: "Initialized"
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "Upgraded"
  ): TypedContractEvent<
    UpgradedEvent.InputTuple,
    UpgradedEvent.OutputTuple,
    UpgradedEvent.OutputObject
  >;

  filters: {
    "AdminChanged(address,address)": TypedContractEvent<
      AdminChangedEvent.InputTuple,
      AdminChangedEvent.OutputTuple,
      AdminChangedEvent.OutputObject
    >;
    AdminChanged: TypedContractEvent<
      AdminChangedEvent.InputTuple,
      AdminChangedEvent.OutputTuple,
      AdminChangedEvent.OutputObject
    >;

    "BeaconUpgraded(address)": TypedContractEvent<
      BeaconUpgradedEvent.InputTuple,
      BeaconUpgradedEvent.OutputTuple,
      BeaconUpgradedEvent.OutputObject
    >;
    BeaconUpgraded: TypedContractEvent<
      BeaconUpgradedEvent.InputTuple,
      BeaconUpgradedEvent.OutputTuple,
      BeaconUpgradedEvent.OutputObject
    >;

    "BondAdded(bytes32,bytes32)": TypedContractEvent<
      BondAddedEvent.InputTuple,
      BondAddedEvent.OutputTuple,
      BondAddedEvent.OutputObject
    >;
    BondAdded: TypedContractEvent<
      BondAddedEvent.InputTuple,
      BondAddedEvent.OutputTuple,
      BondAddedEvent.OutputObject
    >;

    "BondIdentityReissued(bytes32,bytes32)": TypedContractEvent<
      BondIdentityReissuedEvent.InputTuple,
      BondIdentityReissuedEvent.OutputTuple,
      BondIdentityReissuedEvent.OutputObject
    >;
    BondIdentityReissued: TypedContractEvent<
      BondIdentityReissuedEvent.InputTuple,
      BondIdentityReissuedEvent.OutputTuple,
      BondIdentityReissuedEvent.OutputObject
    >;

    "BondRevoked(bytes32,bytes32)": TypedContractEvent<
      BondRevokedEvent.InputTuple,
      BondRevokedEvent.OutputTuple,
      BondRevokedEvent.OutputObject
    >;
    BondRevoked: TypedContractEvent<
      BondRevokedEvent.InputTuple,
      BondRevokedEvent.OutputTuple,
      BondRevokedEvent.OutputObject
    >;

    "CertificateAdded(bytes32,uint256)": TypedContractEvent<
      CertificateAddedEvent.InputTuple,
      CertificateAddedEvent.OutputTuple,
      CertificateAddedEvent.OutputObject
    >;
    CertificateAdded: TypedContractEvent<
      CertificateAddedEvent.InputTuple,
      CertificateAddedEvent.OutputTuple,
      CertificateAddedEvent.OutputObject
    >;

    "CertificateRemoved(bytes32)": TypedContractEvent<
      CertificateRemovedEvent.InputTuple,
      CertificateRemovedEvent.OutputTuple,
      CertificateRemovedEvent.OutputObject
    >;
    CertificateRemoved: TypedContractEvent<
      CertificateRemovedEvent.InputTuple,
      CertificateRemovedEvent.OutputTuple,
      CertificateRemovedEvent.OutputObject
    >;

    "Initialized(uint8)": TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    "Upgraded(address)": TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >;
    Upgraded: TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >;
  };
}
