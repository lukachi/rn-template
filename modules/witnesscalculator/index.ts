import WitnesscalculatorModule from './src/WitnesscalculatorModule'

export async function calcWtnsAuth(
  descriptionFileDataBase64: String,
  privateInputsJsonBase64: String,
): Promise<string> {
  return await WitnesscalculatorModule.calcWtnsAuth(
    descriptionFileDataBase64,
    privateInputsJsonBase64,
  )
}
