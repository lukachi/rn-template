import ExpoModulesCore
import NFCPassportReader

public class EDocumentModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('EDocument')` in JavaScript.
    Name("EDocument")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("scanDocument") { (bacKeyParametersJson: String, challenge: Data) in
        let bacKeyParameters = try JSONDecoder().decode(BacKeyParameters.self, from: bacKeyParametersJson.data(using: .utf8)!)
        
        let mrzKey = PassportUtils.getMRZKey(passportNumber: bacKeyParameters.documentNumber, dateOfBirth: bacKeyParameters.dateOfBirth, dateOfExpiry: bacKeyParameters.dateOfExpiry)
        
        let nfcPassport = try await PassportReader()
            .readPassport(
                mrzKey: mrzKey,
                tags: [.DG1, .DG2, .DG11, .DG15, .SOD],
                customDisplayMessage: nil,
                activeAuthenticationChallenge: [UInt8](challenge)
            )
        
        let passport = Passport.fromNFCPassportModel(nfcPassport)

        return try passport.serialize()
    }
  }
}
