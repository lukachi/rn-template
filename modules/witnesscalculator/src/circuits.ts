import { NewEDocument } from '@modules/e-document/src/helpers/e-document'
import { SupportedCurves } from './curves'

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

export class Circuit {
  constructor(
    public prefixName: string,
    public staticId: number,
    public algorithm: CircuitAlgorithm,
    public hashAlgorithm: CircuitHashAlgorithm,
    public keySize: CircuitKeySize,

    public downloadUrl: string,
    public wtnsCalcMethod: (
      descriptionFileDataBase64: Uint8Array,
      privateInputsJsonBase64: Uint8Array,
    ) => Promise<Uint8Array>,

    public exponent?: CircuitExponent,
    public salt?: CircuitSalt,
    public curve?: SupportedCurves,
  ) {}

  static fromEDoc(eDoc: NewEDocument): Circuit {
    throw new TypeError('Not implemented')
  }

  getName(eDoc: NewEDocument): string {
    const docType: CircuitDocumentType = (() => {
      switch (eDoc.docType) {
        case 'ID':
          return CircuitDocumentType.TD1
        case 'PASSPORT':
          return CircuitDocumentType.TD3
        default:
          return CircuitDocumentType.TD3
      }
    })()

    const name = [
      this.prefixName,
      this.staticId,
      this.hashAlgorithm,
      docType,
      ecChunkNumber,
      ecDigestPosition,
      dg1DigestPositionShift,
    ].join('_') // TODO: not finished

    if (!aaType) {
      name.concat(`_NA`)

      return name
    }

    name.concat([aaTypeId, dg15DigestPositionShift, dg15ChunkNumber, aaKeyPositionShift].join('_'))

    return name
  }
}

export const supportedCircuits: Circuit[] = [
  // RSA
  new Circuit(
    'registerIdentity',
    1,
    CircuitAlgorithm.RSA,
    CircuitHashAlgorithm.SHA256,
    CircuitKeySize.B2048,
    '',
    async () => {},
    CircuitExponent.E65537,
  ),
  new Circuit(
    'registerIdentity',
    2,
    CircuitAlgorithm.RSA,
    CircuitHashAlgorithm.SHA256,
    CircuitKeySize.B4096,
    '',
    async () => {},
    CircuitExponent.E65537,
  ),
  new Circuit(
    'registerIdentity',
    3,
    CircuitAlgorithm.RSA,
    CircuitHashAlgorithm.SHA160,
    CircuitKeySize.B2048,
    '',
    async () => {},
    CircuitExponent.E65537,
  ),
  new Circuit(
    'registerIdentity',
    3,
    CircuitAlgorithm.RSA,
    CircuitHashAlgorithm.SHA160,
    CircuitKeySize.B3072,
    '',
    async () => {},
    CircuitExponent.E3,
  ),

  // RSAPSS
  new Circuit(
    'registerIdentity',
    10,
    CircuitAlgorithm.RSAPSS,
    CircuitHashAlgorithm.SHA256,
    CircuitKeySize.B2048,
    '',
    async () => {},
    CircuitExponent.E65537,
    CircuitSalt.S32,
  ),
  new Circuit(
    'registerIdentity',
    11,
    CircuitAlgorithm.RSAPSS,
    CircuitHashAlgorithm.SHA256,
    CircuitKeySize.B2048,
    '',
    async () => {},
    CircuitExponent.E65537,
    CircuitSalt.S32,
  ),
  new Circuit(
    'registerIdentity',
    12,
    CircuitAlgorithm.RSAPSS,
    CircuitHashAlgorithm.SHA256,
    CircuitKeySize.B2048,
    '',
    async () => {},
    CircuitExponent.E65537,
    CircuitSalt.S64,
  ),
  new Circuit(
    'registerIdentity',
    13,
    CircuitAlgorithm.RSAPSS,
    CircuitHashAlgorithm.SHA384,
    CircuitKeySize.B2048,
    '',
    async () => {},
    CircuitExponent.E65537,
    CircuitSalt.S48,
  ),
  new Circuit(
    'registerIdentity',
    11,
    CircuitAlgorithm.RSAPSS,
    CircuitHashAlgorithm.SHA256,
    CircuitKeySize.B3072,
    '',
    async () => {},
    CircuitExponent.E65537,
    CircuitSalt.S32,
  ),

  // ECDSA
  new Circuit(
    'registerIdentity',
    20,
    CircuitAlgorithm.ECDSA,
    CircuitHashAlgorithm.SHA256,
    CircuitKeySize.B256,
    '',
    async () => {},
    undefined,
    undefined,
    SupportedCurves.SECP256R1,
  ),
  new Circuit(
    'registerIdentity',
    24,
    CircuitAlgorithm.ECDSA,
    CircuitHashAlgorithm.SHA224,
    CircuitKeySize.B224,
    '',
    async () => {},
    undefined,
    undefined,
    SupportedCurves.SECP224R1,
  ),
  new Circuit(
    'registerIdentity',
    21,
    CircuitAlgorithm.ECDSA,
    CircuitHashAlgorithm.SHA256,
    CircuitKeySize.B256,
    '',
    async () => {},
    undefined,
    undefined,
    SupportedCurves.BRAINPOOLP256,
  ),
  new Circuit(
    'registerIdentity',
    22,
    CircuitAlgorithm.ECDSA,
    CircuitHashAlgorithm.SHA256,
    CircuitKeySize.B320,
    '',
    async () => {},
    undefined,
    undefined,
    SupportedCurves.BRAINPOOL320R1,
  ),
  new Circuit(
    'registerIdentity',
    23,
    CircuitAlgorithm.ECDSA,
    CircuitHashAlgorithm.SHA160,
    CircuitKeySize.B192,
    '',
    async () => {},
    undefined,
    undefined,
    SupportedCurves.SECP192R1,
  ),
  new Circuit(
    'registerIdentity',
    20,
    CircuitAlgorithm.ECDSA,
    CircuitHashAlgorithm.SHA256,
    CircuitKeySize.B256,
    '',
    async () => {},
    undefined,
    undefined,
    SupportedCurves.PRIME256V1,
  ),
  new Circuit(
    'registerIdentity',
    20,
    CircuitAlgorithm.ECDSA,
    CircuitHashAlgorithm.SHA384,
    CircuitKeySize.B384,
    '',
    async () => {},
    undefined,
    undefined,
    SupportedCurves.BRAINPOOLP384R1,
  ),
  new Circuit(
    'registerIdentity',
    20,
    CircuitAlgorithm.ECDSA,
    CircuitHashAlgorithm.SHA512,
    CircuitKeySize.B512,
    '',
    async () => {},
    undefined,
    undefined,
    SupportedCurves.BRAINPOOLP512R1,
  ),
]
