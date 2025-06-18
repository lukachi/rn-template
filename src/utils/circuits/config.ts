import { calcWtnsRegisterIdentityUniversalRSA2048 } from '@modules/witnesscalculator'

export class CircuitParams {
  constructor(
    public name: string,

    public downloadUrl: string,
    public wtnsCalcMethod: (
      descriptionFileDataBase64: Uint8Array,
      privateInputsJsonBase64: Uint8Array,
    ) => Promise<Uint8Array>,
  ) {}

  static fromName(circuitName: string): CircuitParams {
    const found = supportedCircuits.find(el => el.name === circuitName)

    if (!found) {
      throw new Error(`Circuit with name ${circuitName} not found`)
    }

    return found
  }
}

export const supportedCircuits = [
  new CircuitParams(
    'registerIdentity_1_256_3_5_576_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.0/registerIdentity_1_256_3_5_576_248_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_1_256_3_6_576_248_1_2432_5_296',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.0/registerIdentity_1_256_3_6_576_248_1_2432_5_296-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_2_256_3_6_336_264_21_2448_6_2008',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.0/registerIdentity_2_256_3_6_336_264_21_2448_6_2008-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_21_256_3_7_336_264_21_3072_6_2008',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.0/registerIdentity_21_256_3_7_336_264_21_3072_6_2008-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_1_256_3_6_576_264_1_2448_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.1/registerIdentity_1_256_3_6_576_264_1_2448_3_256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_2_256_3_6_336_248_1_2432_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.1/registerIdentity_2_256_3_6_336_248_1_2432_3_256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_2_256_3_6_576_248_1_2432_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.1/registerIdentity_2_256_3_6_576_248_1_2432_3_256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new CircuitParams(
    'registerIdentity_11_256_3_3_576_248_1_1184_5_264',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.2/registerIdentity_11_256_3_3_576_248_1_1184_5_264-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_12_256_3_3_336_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.2/registerIdentity_12_256_3_3_336_232_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_1_256_3_4_336_232_1_1480_5_296',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.2/registerIdentity_1_256_3_4_336_232_1_1480_5_296-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_1_256_3_4_600_248_1_1496_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.8/registerIdentity_1_256_3_4_600_248_1_1496_3_256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new CircuitParams(
    'registerIdentity_1_160_3_4_576_200_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.3/registerIdentity_1_160_3_4_576_200_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_21_256_3_3_336_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.3/registerIdentity_21_256_3_3_336_232_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_24_256_3_4_336_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.3/registerIdentity_24_256_3_4_336_232_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new CircuitParams(
    'registerIdentity_20_256_3_3_336_224_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.4/registerIdentity_20_256_3_3_336_224_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_1_256_3_3_576_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.4/registerIdentity_1_256_3_3_576_248_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_1_160_3_3_576_200_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.4/registerIdentity_1_160_3_3_576_200_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_10_256_3_3_576_248_1_1184_5_264',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.5/registerIdentity_10_256_3_3_576_248_1_1184_5_264-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_11_256_3_5_576_248_1_1808_4_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.5/registerIdentity_11_256_3_5_576_248_1_1808_4_256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_21_256_3_3_576_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.5/registerIdentity_21_256_3_3_576_232_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new CircuitParams(
    'registerIdentity_3_160_3_3_336_200_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.7-fix/registerIdentity_3_160_3_3_336_200_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_3_160_3_4_576_216_1_1512_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.7-fix/registerIdentity_3_160_3_4_576_216_1_1512_3_256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_2_256_3_6_336_264_1_2448_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.7-fix/registerIdentity_2_256_3_6_336_264_1_2448_3_256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new CircuitParams(
    'registerIdentity_21_256_3_4_576_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.8/registerIdentity_21_256_3_4_576_232_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_11_256_3_3_576_240_1_864_5_264',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.8/registerIdentity_11_256_3_3_576_240_1_864_5_264-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new CircuitParams(
    'registerIdentity_11_256_3_5_576_248_1_1808_5_296',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.9/registerIdentity_11_256_3_5_576_248_1_1808_5_296-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new CircuitParams(
    'registerIdentity_11_256_3_3_336_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.10/registerIdentity_11_256_3_3_336_248_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_14_256_3_4_336_64_1_1480_5_296',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.10/registerIdentity_14_256_3_4_336_64_1_1480_5_296-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_21_256_3_5_576_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.10/registerIdentity_21_256_3_5_576_232_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new CircuitParams(
    'registerIdentity_1_256_3_6_336_560_1_2744_4_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.11/registerIdentity_1_256_3_6_336_560_1_2744_4_256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_1_256_3_6_336_248_1_2744_4_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.11/registerIdentity_1_256_3_6_336_248_1_2744_4_256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_20_256_3_5_336_72_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.11/registerIdentity_20_256_3_5_336_72_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new CircuitParams(
    'registerIdentity_4_160_3_3_336_216_1_1296_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.12/registerIdentity_4_160_3_3_336_216_1_1296_3_256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_15_512_3_3_336_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.12/registerIdentity_15_512_3_3_336_248_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentity_20_160_3_3_736_200_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.12/registerIdentity_20_160_3_3_736_200_NA-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new CircuitParams(
    'registerIdentityLight160',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.6-light/registerIdentityLight160-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentityLight224',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.6-light/registerIdentityLight224-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentityLight256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.6-light/registerIdentityLight256-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentityLight384',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.6-light/registerIdentityLight384-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new CircuitParams(
    'registerIdentityLight512',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.6-light/registerIdentityLight512-download.zip',
    calcWtnsRegisterIdentityUniversalRSA2048,
  ),
]
