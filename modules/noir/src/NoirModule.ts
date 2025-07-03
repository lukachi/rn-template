import { NativeModule, requireNativeModule } from 'expo'

declare class NoirModule extends NativeModule<{
  prove: () => Promise<string>
}> {}

// This call loads the native module object from the JSI.
export default requireNativeModule<NoirModule>('Noir')
