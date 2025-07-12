import { default as NoirModule } from './src/NoirModule'
import * as FileSystem from 'expo-file-system'

export type NoirZKProof = {
  proof: string
  pub_signals: string[]
}

export class NoirCircuitParams {
  public static readonly TrustedSetupFileName = `${FileSystem.documentDirectory}/noir/ultraPlonkTrustedSetup.dat`

  constructor(
    public name: string,
    public byteCodeUri: string,
    public pub_signals_count: number,
  ) {}

  static fromName(circuitName: string): NoirCircuitParams {
    const found = supportedNoirCircuits.find(el => el.name === circuitName)

    if (!found) {
      throw new Error(`Noir Circuit with name ${circuitName} not found`)
    }

    return found
  }

  static async getTrustedSetupUri() {
    const fileInfo = await FileSystem.getInfoAsync(NoirCircuitParams.TrustedSetupFileName)

    if (!fileInfo.exists) {
      return null
    }

    return fileInfo.uri
  }

  static async downloadTrustedSetup(opts?: {
    onDownloadingProgress?: (p: FileSystem.DownloadProgressData) => void
  }) {
    const dir = `${FileSystem.documentDirectory}noir`

    // Ensure that the folder exists
    const dirInfo = await FileSystem.getInfoAsync(dir)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
    }

    // Preparing path
    const fileUri = `${dir}/ultraPlonkTrustedSetup.dat`
    const url =
      'https://storage.googleapis.com/rarimo-store/trusted-setups/ultraPlonkTrustedSetup.dat'

    // Continue downloading
    const downloadResumable = FileSystem.createDownloadResumable(url, fileUri, {}, progress => {
      // DEBUG DOWNLOADING
      // console.log(
      //   `Progress: ${((progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100).toFixed(1)}%`,
      // )
      opts?.onDownloadingProgress?.(progress)
    })

    if (!(await NoirCircuitParams.getTrustedSetupUri())) {
      await downloadResumable.downloadAsync()
    }

    const uri = await NoirCircuitParams.getTrustedSetupUri()

    if (!uri) {
      throw new Error('Failed to download trusted setup')
    }

    return uri
  }

  static async getByteCodeUri(filename: string) {
    const fileInfo = await FileSystem.getInfoAsync(filename)

    if (!fileInfo.exists) {
      return null
    }

    return fileInfo.uri
  }

  async downloadByteCode(opts?: {
    onDownloadingProgress?: (downloadProgress: FileSystem.DownloadProgressData) => void
  }): Promise<string> {
    const fileName = `${FileSystem.documentDirectory}/noir/${this.name}-bytecode.json`
    const downloadResumable = FileSystem.createDownloadResumable(
      this.byteCodeUri,
      fileName,
      {},
      downloadProgress => {
        opts?.onDownloadingProgress?.(downloadProgress)
      },
    )

    if (!(await NoirCircuitParams.getByteCodeUri(fileName))) {
      await downloadResumable.downloadAsync()
    }

    const uri = await NoirCircuitParams.getByteCodeUri(fileName)

    if (!uri) {
      throw new Error(`Failed to download bytecode for noir circuit ${this.name}`)
    }

    const byteCode = await FileSystem.readAsStringAsync(uri)

    if (!byteCode) {
      throw new Error(`Failed to read bytecode for noir circuit ${this.name}`)
    }

    return byteCode
  }

  async prove(inputs: string, byteCodeString: string): Promise<NoirZKProof> {
    const trustedSetupUri = await NoirCircuitParams.getTrustedSetupUri()

    if (!trustedSetupUri) {
      throw new Error('Trusted setup not found. Please download it first.')
    }

    const proof: string = await NoirModule.provePlonk(trustedSetupUri, inputs, byteCodeString)

    if (!proof) {
      throw new Error(`Failed to generate proof for noir circuit ${this.name}`)
    }

    const pubSignalDataLength = 64 // hex

    const pubSignals: string[] = []
    for (let i = 0; i < this.pub_signals_count; i++) {
      const start = i * pubSignalDataLength
      const end = start + pubSignalDataLength
      pubSignals.push(proof.substring(start, end))
    }

    const actualProof = proof.substring(pubSignalDataLength * this.pub_signals_count)

    return {
      pub_signals: pubSignals,
      proof: actualProof,
    }
  }
}

export class NoirLocalCircuitParams extends NoirCircuitParams {
  constructor(
    public name: string,
    public getByteCodeFn: () => string,
    public pub_signals_count: number,
  ) {
    super(name, '', pub_signals_count)
  }

  async downloadByteCode() {
    const byteCode = this.getByteCodeFn()

    return typeof byteCode === 'string' ? byteCode : JSON.stringify(byteCode)
  }
}

const supportedNoirCircuits: NoirCircuitParams[] = [
  new NoirLocalCircuitParams(
    'registerIdentity_inid_ca',
    () => require('@assets/circuits/noir/register/inid/byte_code.json'),
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_26_512_3_3_336_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.15/registerIdentity_26_512_3_3_336_248_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_2_256_3_6_336_264_21_2448_6_2008',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.3/registerIdentity_2_256_3_6_336_264_21_2448_6_2008.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_2_256_3_6_336_248_1_2432_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.3/registerIdentity_2_256_3_6_336_248_1_2432_3_256.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_20_256_3_3_336_224_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.3/registerIdentity_20_256_3_3_336_224_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_10_256_3_3_576_248_1_1184_5_264',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v1.0.4/registerIdentity_10_256_3_3_576_248_1_1184_5_264.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_1_256_3_4_600_248_1_1496_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v1.0.4/registerIdentity_1_256_3_4_600_248_1_1496_3_256.json',
    5,
  ),
  // TODO: implement me
  new NoirCircuitParams('registerIdentity_21_256_3_3_336_232_NA', '', 5),
  new NoirCircuitParams(
    'registerIdentity_21_256_3_4_576_232_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.5-fix/registerIdentity_21_256_3_4_576_232_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_11_256_3_3_576_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.10-fix/registerIdentity_11_256_3_3_576_248_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_2_256_3_6_576_248_1_2432_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.6-fix/registerIdentity_2_256_3_6_576_248_1_2432_3_256.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_3_512_3_3_336_264_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.6-fix/registerIdentity_3_512_3_3_336_264_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_14_256_3_3_576_240_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.8-fix/registerIdentity_14_256_3_3_576_240_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_14_256_3_4_576_248_1_1496_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.8-fix/registerIdentity_14_256_3_4_576_248_1_1496_3_256.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_20_160_3_2_576_184_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.8-fix/registerIdentity_20_160_3_2_576_184_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_1_256_3_5_336_248_1_2120_4_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.7-fix/registerIdentity_1_256_3_5_336_248_1_2120_4_256.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_2_256_3_4_336_232_1_1480_4_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.7-fix/registerIdentity_2_256_3_4_336_232_1_1480_4_256.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_2_256_3_4_336_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.7-fix/registerIdentity_2_256_3_4_336_248_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_20_256_3_5_336_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.11-fix/registerIdentity_20_256_3_5_336_248_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_24_256_3_4_336_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.11-fix/registerIdentity_24_256_3_4_336_248_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_6_160_3_3_336_216_1_1080_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.11-fix/registerIdentity_6_160_3_3_336_216_1_1080_3_256.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_11_256_3_5_576_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.12-fix/registerIdentity_11_256_3_5_576_248_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_14_256_3_4_336_232_1_1480_5_296',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.12-fix/registerIdentity_14_256_3_4_336_232_1_1480_5_296.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_1_256_3_4_576_232_1_1480_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.12-fix/registerIdentity_1_256_3_4_576_232_1_1480_3_256.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_1_256_3_5_576_248_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.9-fix/registerIdentity_1_256_3_5_576_248_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_20_160_3_3_576_200_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.9-fix/registerIdentity_20_160_3_3_576_200_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_23_160_3_3_576_200_NA',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.10-fix/registerIdentity_23_160_3_3_576_200_NA.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_3_256_3_4_600_248_1_1496_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.10-fix/registerIdentity_3_256_3_4_600_248_1_1496_3_256.json',
    5,
  ),
  new NoirCircuitParams(
    'registerIdentity_1_256_3_6_576_264_1_2448_3_256',
    'https://storage.googleapis.com/rarimo-store/passport-zk-circuits-noir/v0.1.9-fix/registerIdentity_1_256_3_6_576_264_1_2448_3_256.json',
    5,
  ),
]
