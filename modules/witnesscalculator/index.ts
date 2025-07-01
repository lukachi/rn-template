import { Asset } from 'expo-asset'
import WitnesscalculatorModule from './src/WitnesscalculatorModule'
import * as FileSystem from 'expo-file-system'
import { unzip } from 'react-native-zip-archive'

class CircuitParams {
  constructor(
    public name: string,
    public retrieveZkeyNDat: (opts?: {
      onDownloadStart?: () => void
      onDownloadingProgress?: (downloadProgressData: FileSystem.DownloadProgressData) => void
      onLoaded?: () => void
      onFailed?: (error?: Error) => void
    }) => Promise<{
      zkeyLocalUri: string
      datBytes: Uint8Array
    }>,
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

export class LocalCircuitParams extends CircuitParams {
  static fromName(circuitName: string): LocalCircuitParams {
    return super.fromName(circuitName) as LocalCircuitParams
  }

  constructor(
    public name: string,

    public zkeyAssetModuleId: string,
    public datAssetModuleId: string,

    public wtnsCalcMethod: (
      descriptionFileDataBase64: Uint8Array,
      privateInputsJsonBase64: Uint8Array,
    ) => Promise<Uint8Array>,
  ) {
    super(
      name,
      async () => {
        const [datAssetInfo] = await Asset.loadAsync(datAssetModuleId)

        if (!datAssetInfo.localUri) throw new TypeError('Dat file not found')

        const datFileInfo = await FileSystem.getInfoAsync(datAssetInfo.localUri)

        if (!datFileInfo?.exists) throw new TypeError('Dat file not found')

        const datBase64 = await FileSystem.readAsStringAsync(datFileInfo.uri, {
          encoding: FileSystem.EncodingType.Base64,
        })

        const [zkeyAssetInfo] = await Asset.loadAsync(zkeyAssetModuleId)

        if (!zkeyAssetInfo.localUri) throw new TypeError('Zkey file not found')

        const zkeyFileInfo = await FileSystem.getInfoAsync(zkeyAssetInfo.localUri)

        if (!zkeyFileInfo?.exists) throw new TypeError('Zkey file not found')

        return {
          zkeyLocalUri: zkeyFileInfo.uri.replace('file://', ''), // TODO: check if replace is for iOS only
          datBytes: Buffer.from(datBase64, 'base64'),
        }
      },
      wtnsCalcMethod,
    )
  }
}

export class ExternalCircuitParams extends CircuitParams {
  static fromName(circuitName: string): ExternalCircuitParams {
    return super.fromName(circuitName) as ExternalCircuitParams
  }

  static async #checkCircuitsLoaded(zkeyPath: string, datPath: string) {
    const zkeyInfo = await FileSystem.getInfoAsync(zkeyPath)
    const datInfo = await FileSystem.getInfoAsync(datPath)

    return zkeyInfo.exists && datInfo.exists
  }

  constructor(
    public name: string,

    public downloadUrl: string,

    public wtnsCalcMethod: (
      descriptionFileDataBase64: Uint8Array,
      privateInputsJsonBase64: Uint8Array,
    ) => Promise<Uint8Array>,
  ) {
    super(
      name,
      async opts => {
        opts?.onDownloadStart?.()

        try {
          const fileUri = `${FileSystem.documentDirectory}${name}.zip`
          const targetPath = `${FileSystem.documentDirectory}${name}`

          const circuitDirSubpath = `${name}-download`
          const zkeyPath = `${targetPath}/${circuitDirSubpath}/circuit_final.zkey`
          const datPath = `${targetPath}/${circuitDirSubpath}/${name}.dat`

          const isCircuitsLoaded = await ExternalCircuitParams.#checkCircuitsLoaded(
            zkeyPath,
            datPath,
          )

          if (isCircuitsLoaded) {
            const dat = await FileSystem.readAsStringAsync(datPath, {
              encoding: FileSystem.EncodingType.Base64,
            })

            opts?.onLoaded?.()

            return {
              zkeyLocalUri: zkeyPath,
              datBytes: Buffer.from(dat, 'base64'),
            }
          }

          const downloadResumable = FileSystem.createDownloadResumable(
            downloadUrl,
            fileUri,
            {},
            downloadProgress => {
              opts?.onDownloadingProgress?.(downloadProgress)
            },
          )

          const downloadResult = await downloadResumable.downloadAsync()

          if (!downloadResult) {
            throw new TypeError('Download failed: downloadResult is undefined')
          }

          await unzip(downloadResult.uri, targetPath)

          const dat = await FileSystem.readAsStringAsync(datPath, {
            encoding: FileSystem.EncodingType.Base64,
          })

          opts?.onLoaded?.()

          return {
            zkeyLocalUri: zkeyPath,
            datBytes: Buffer.from(dat, 'base64'),
          }
        } catch (error) {
          console.error('Error in loadCircuit: ', error)
          opts?.onFailed?.(error instanceof Error ? error : new Error(String(error)))
        }

        throw new TypeError('Circuit loading failed without error')
      },
      wtnsCalcMethod,
    )
  }
}

export const supportedCircuits: CircuitParams[] = [
  new LocalCircuitParams(
    'auth',
    require('@assets/circuits/auth/circuit_final.zkey'),
    require('@assets/circuits/auth/auth.dat'),
    (datBytes, inputs) => {
      return WitnesscalculatorModule.calcWtnsAuth(new Uint8Array(datBytes), new Uint8Array(inputs))
    },
  ),

  new ExternalCircuitParams(
    'registerIdentity_1_256_3_5_576_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.0/registerIdentity_1_256_3_5_576_248_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_1_256_3_6_576_248_1_2432_5_296',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.0/registerIdentity_1_256_3_6_576_248_1_2432_5_296-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_2_256_3_6_336_264_21_2448_6_2008',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.0/registerIdentity_2_256_3_6_336_264_21_2448_6_2008-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_21_256_3_7_336_264_21_3072_6_2008',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.0/registerIdentity_21_256_3_7_336_264_21_3072_6_2008-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_1_256_3_6_576_264_1_2448_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.1/registerIdentity_1_256_3_6_576_264_1_2448_3_256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_2_256_3_6_336_248_1_2432_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.1/registerIdentity_2_256_3_6_336_248_1_2432_3_256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_2_256_3_6_576_248_1_2432_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.1/registerIdentity_2_256_3_6_576_248_1_2432_3_256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new ExternalCircuitParams(
    'registerIdentity_11_256_3_3_576_248_1_1184_5_264',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.2/registerIdentity_11_256_3_3_576_248_1_1184_5_264-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_12_256_3_3_336_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.2/registerIdentity_12_256_3_3_336_232_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_1_256_3_4_336_232_1_1480_5_296',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.2/registerIdentity_1_256_3_4_336_232_1_1480_5_296-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_1_256_3_4_600_248_1_1496_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.8/registerIdentity_1_256_3_4_600_248_1_1496_3_256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new ExternalCircuitParams(
    'registerIdentity_1_160_3_4_576_200_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.3/registerIdentity_1_160_3_4_576_200_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_21_256_3_3_336_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.3/registerIdentity_21_256_3_3_336_232_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_24_256_3_4_336_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.3/registerIdentity_24_256_3_4_336_232_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new ExternalCircuitParams(
    'registerIdentity_20_256_3_3_336_224_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.4/registerIdentity_20_256_3_3_336_224_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_1_256_3_3_576_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.4/registerIdentity_1_256_3_3_576_248_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_1_160_3_3_576_200_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.4/registerIdentity_1_160_3_3_576_200_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_10_256_3_3_576_248_1_1184_5_264',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.5/registerIdentity_10_256_3_3_576_248_1_1184_5_264-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_11_256_3_5_576_248_1_1808_4_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.5/registerIdentity_11_256_3_5_576_248_1_1808_4_256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_21_256_3_3_576_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.5/registerIdentity_21_256_3_3_576_232_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new ExternalCircuitParams(
    'registerIdentity_3_160_3_3_336_200_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.7-fix/registerIdentity_3_160_3_3_336_200_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_3_160_3_4_576_216_1_1512_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.7-fix/registerIdentity_3_160_3_4_576_216_1_1512_3_256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_2_256_3_6_336_264_1_2448_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.7-fix/registerIdentity_2_256_3_6_336_264_1_2448_3_256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new ExternalCircuitParams(
    'registerIdentity_21_256_3_4_576_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.8/registerIdentity_21_256_3_4_576_232_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_11_256_3_3_576_240_1_864_5_264',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.8/registerIdentity_11_256_3_3_576_240_1_864_5_264-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new ExternalCircuitParams(
    'registerIdentity_11_256_3_5_576_248_1_1808_5_296',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.9/registerIdentity_11_256_3_5_576_248_1_1808_5_296-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new ExternalCircuitParams(
    'registerIdentity_11_256_3_3_336_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.10/registerIdentity_11_256_3_3_336_248_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_14_256_3_4_336_64_1_1480_5_296',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.10/registerIdentity_14_256_3_4_336_64_1_1480_5_296-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_21_256_3_5_576_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.10/registerIdentity_21_256_3_5_576_232_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new ExternalCircuitParams(
    'registerIdentity_1_256_3_6_336_560_1_2744_4_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.11/registerIdentity_1_256_3_6_336_560_1_2744_4_256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_1_256_3_6_336_248_1_2744_4_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.11/registerIdentity_1_256_3_6_336_248_1_2744_4_256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_20_256_3_5_336_72_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.11/registerIdentity_20_256_3_5_336_72_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new ExternalCircuitParams(
    'registerIdentity_4_160_3_3_336_216_1_1296_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.12/registerIdentity_4_160_3_3_336_216_1_1296_3_256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_15_512_3_3_336_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.12/registerIdentity_15_512_3_3_336_248_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentity_20_160_3_3_736_200_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.12/registerIdentity_20_160_3_3_736_200_NA-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),

  new ExternalCircuitParams(
    'registerIdentityLight160',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.6-light/registerIdentityLight160-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentityLight224',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.6-light/registerIdentityLight224-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentityLight256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.6-light/registerIdentityLight256-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentityLight384',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.6-light/registerIdentityLight384-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
  new ExternalCircuitParams(
    'registerIdentityLight512',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits/v0.2.6-light/registerIdentityLight512-download.zip',
    WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048,
  ),
]

export async function calcWtnsAuth(
  descriptionFileDataBase64: Uint8Array,
  privateInputsJsonBase64: Uint8Array,
): Promise<Uint8Array> {
  return await WitnesscalculatorModule.calcWtnsAuth(
    new Uint8Array(descriptionFileDataBase64),
    new Uint8Array(privateInputsJsonBase64),
  )
}

export async function calcWtnsRegisterIdentityUniversalRSA2048(
  descriptionFileDataBase64: Uint8Array,
  privateInputsJsonBase64: Uint8Array,
): Promise<Uint8Array> {
  return await WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA2048(
    new Uint8Array(descriptionFileDataBase64),
    new Uint8Array(privateInputsJsonBase64),
  )
}

export async function calcWtnsRegisterIdentityUniversalRSA4096(
  descriptionFileDataBase64: Uint8Array,
  privateInputsJsonBase64: Uint8Array,
): Promise<Uint8Array> {
  return await WitnesscalculatorModule.calcWtnsRegisterIdentityUniversalRSA4096(
    new Uint8Array(descriptionFileDataBase64),
    new Uint8Array(privateInputsJsonBase64),
  )
}
