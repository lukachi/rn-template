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
                    customDisplayMessage: PassportUtils.customDisplayMessage,
                    activeAuthenticationChallenge: [UInt8](challenge)
                )
            
            let passport = Passport.fromNFCPassportModel(nfcPassport)
            
            let passportJsonBytes = try passport.serialize()
            
            return String(data: passportJsonBytes, encoding: .utf8)!
        }
        
        
        AsyncFunction("getPublicKeyPem") { (sod: Data) in
            let sod = try sodFrom(sod)
            
            let publicKey = try sod.getPublicKey()
            
            let publicKeyPem = OpenSSLUtils.pubKeyToPEM(pubKey: publicKey)
            
            return publicKeyPem.data(using: .utf8) ?? Data()
        }
        
        AsyncFunction("getSlaveCertificatePem") { (sod: Data) in
            let sod = try sodFrom(sod)
            
            guard let cert = try OpenSSLUtils.getX509CertificatesFromPKCS7(pkcs7Der: Data(sod.pkcs7CertificateData)).first else { throw "Slave certificate in sod is missing" }
            
            let certPem = cert.certToPEM().data(using: .utf8) ?? Data()
            
            return certPem
        }
    }
    
    private func sodFrom(_ sod: Data) throws -> SOD {
        return try SOD([UInt8](sod))
    }
}
