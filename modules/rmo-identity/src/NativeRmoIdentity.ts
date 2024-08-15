import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number
  generatePrivateKey(): Promise<string>
  calculateEventNullifierInt(event: string, secretKey: string): Promise<string>
}

export default TurboModuleRegistry.getEnforcing<Spec>('RmoIdentity')
