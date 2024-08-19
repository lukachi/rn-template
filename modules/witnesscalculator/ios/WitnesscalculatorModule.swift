import ExpoModulesCore

public class WitnesscalculatorModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('Witnesscalculator')` in JavaScript.
    Name("Witnesscalculator")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("calcWtnsAuth") { (descriptionFileDataBase64: String, privateInputsJsonBase64: String) in
        do {
            guard let descriptionFileData = Data(base64Encoded: descriptionFileDataBase64) else {
                throw "Invalid base64 encoded descriptionFileData"
            }
            guard let privateInputsJson = Data(base64Encoded: privateInputsJsonBase64) else {
                throw "Invalid base64 encoded privateInputsJson"
            }

            let result = try WtnsUtils.calcWtnsAuth(descriptionFileData, privateInputsJson)

            return result.base64EncodedString()
        } catch {
            throw error;
        }
    }
  }
}
