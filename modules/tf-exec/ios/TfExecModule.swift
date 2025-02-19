import ExpoModulesCore
import TensorFlowLite
import Foundation

public class TfExecModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('TfExec')` in JavaScript.
    Name("TfExec")

    AsyncFunction("execTFLite") { (modelSrc: String, inputBytes: Data) in
      guard let modelSrcURL = URL(string: modelSrc.replacingOccurrences(of: "file://", with: "")) else {
        throw NSError(domain: "Invalid URL", code: 0, userInfo: nil)
      }
      
      do {
        let interpreter = try Interpreter(modelPath: modelSrcURL.path)

        try interpreter.allocateTensors()

        try interpreter.copy(inputBytes, toInputAt: 0)
        
        try interpreter.invoke()
        
        let outputTensor = try interpreter.output(at: 0)
        let outputData = outputTensor.data
        
        return outputData
      } catch let error {
        print("Error: \(error)")
        throw error
      }
    }
  }
}
