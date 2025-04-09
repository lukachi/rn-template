import { NativeModule, requireNativeModule } from 'expo'

declare class TfExecModule extends NativeModule {}

// This call loads the native module object from the JSI.
export default requireNativeModule<
  TfExecModule & {
    execTFLite: (modelSrc: string, inputs: string[]) => Promise<Uint8Array>
  }
>('TfExec')
