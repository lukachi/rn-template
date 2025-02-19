// Reexport the native module. On web, it will be resolved to TfExecModule.web.ts
// and on native platforms to TfExecModule.ts
import { default as TfExecModule } from './src/TfExecModule'

export const execTFLite = TfExecModule.execTFLite
