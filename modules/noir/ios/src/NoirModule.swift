import ExpoModulesCore
import SwoirenbergLib

public class NoirModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('Noir')` in JavaScript.
    Name("Noir")

    AsyncFunction("prove") { (trustedSetupUri: String, inputs: String, utf8ByteCodeString: String) in
      guard let byteCodeData = utf8ByteCodeString.data(using: .utf8) else {
        throw NSError(domain: "NoirModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to convert bytecode string to Data"])
      }
      
      guard let inputsDictionaryMap = try JSONSerialization.jsonObject(with: inputs.data(using: .utf8)!, options: []) as? [String: Any] else {
        throw NSError(domain: "NoirModule", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to convert inputs string to Dictionary"])
      }

      let circuit = try Swoir(backend: Swoirenberg.self).createCircuit(manifest: byteCodeData)
      
      try circuit.setupSrs(srs_path: trustedSetupUri)

      let proof = try circuit.prove(inputsDictionaryMap, proof_type: "plonk")
      
      return proof.proof
    }
  }
}
