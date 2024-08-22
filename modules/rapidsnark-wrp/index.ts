// Import the native module. On web, it will be resolved to RapidsnarkWrp.web.ts
// and on native platforms to RapidsnarkWrp.ts

import RapidsnarkWrpModule from './src/RapidsnarkWrpModule'

export const groth16Prove = async (wtns: Uint8Array, zkey: Uint8Array): Promise<Uint8Array> => {
  return await RapidsnarkWrpModule.groth16Prove(new Uint8Array(wtns), new Uint8Array(zkey))
}
