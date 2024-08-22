import WitnesscalculatorModule from './src/WitnesscalculatorModule'

export async function calcWtnsAuth(
  descriptionFileDataBase64: Uint8Array,
  privateInputsJsonBase64: Uint8Array,
): Promise<Uint8Array> {
  return await WitnesscalculatorModule.calcWtnsAuth(
    new Uint8Array(descriptionFileDataBase64),
    new Uint8Array(privateInputsJsonBase64),
  )
}
