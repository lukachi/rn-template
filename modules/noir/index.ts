// Reexport the native module. On web, it will be resolved to NoirModule.web.ts
// and on native platforms to NoirModule.ts
import { default as NoirModule } from './src/NoirModule'

export const prove = async () => {
  return NoirModule.prove()
}
