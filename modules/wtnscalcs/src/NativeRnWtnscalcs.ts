import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number
  plus(a: number, b: number): number
  generateAuthWtns(jsonInputs: string): Promise<string>
}

export default TurboModuleRegistry.getEnforcing<Spec>('RnWtnscalcs')
