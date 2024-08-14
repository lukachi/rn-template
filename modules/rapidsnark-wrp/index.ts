// Import the native module. On web, it will be resolved to RapidsnarkWrp.web.ts
// and on native platforms to RapidsnarkWrp.ts

import RapidsnarkWrpModule from './src/RapidsnarkWrpModule'

export const groth16Prove = async (wtnsBase64: string, zkeyBase64: string): Promise<string> => {
  return await RapidsnarkWrpModule.groth16Prove(wtnsBase64, zkeyBase64)
}
