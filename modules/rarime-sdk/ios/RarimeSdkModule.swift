import ExpoModulesCore

extension String {
    
    /// Create `Data` from hexadecimal string representation
    ///
    /// This creates a `Data` object from hex string. Note, if the string has any spaces or non-hex characters (e.g. starts with '<' and with a '>'), those are ignored and only hex characters are processed.
    ///
    /// - returns: Data represented by this hexadecimal string.
    
    var hexadecimal: Data? {
        var data = Data(capacity: count / 2)
        
        let regex = try! NSRegularExpression(pattern: "[0-9a-f]{1,2}", options: .caseInsensitive)
        regex.enumerateMatches(in: self, range: NSRange(startIndex..., in: self)) { match, _, _ in
            let byteString = (self as NSString).substring(with: match!.range)
            let num = UInt8(byteString, radix: 16)!
            data.append(num)
        }
        
        guard data.count > 0 else { return nil }
        
        return data
    }
    
}

extension Data {
    
    /// Hexadecimal string representation of `Data` object.
    
    var hexadecimal: String {
        return map { String(format: "%02x", $0) }
            .joined()
    }
}

extension String: Error {}

public class RarimeSdkModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('RarimeSdk')` in JavaScript.
    Name("RarimeSdk")

    AsyncFunction("generatePrivateKey") {
        let privateKeyData = IdentityNewBJJSecretKey()
        
        return privateKeyData
    }
      
    AsyncFunction("registrationChallenge") { (userPK: String) in
        guard let userPKData = userPK.hexadecimal else {
            throw "Invalid userPK"
        }
        
        let profile = try IdentityProfile().newProfile(userPKData)

        return try profile.getRegistrationChallenge()
    }

    AsyncFunction("calculateEventNullifierInt") { (eventId: String, userPK: String) in
        var error: NSError?

        guard let userPKData = userPK.hexadecimal else {
            throw "Invalid userPK"
        }
        
        let profile = try IdentityProfile().newProfile(userPKData)
        
        let result = profile.calculateEventNullifierInt(eventId, error: &error)
        
        if let error = error {
            throw error
        }

        return result
    }
      
      AsyncFunction("getSlaveCertIndex") {(slaveCertPem: Data, mastersPem: Data) in
          let x509Utils = IdentityX509Util()
          
          let slaveCertificateIndex = try x509Utils.getSlaveCertificateIndex(slaveCertPem, mastersPem: mastersPem)
          
          return slaveCertificateIndex
      }

      AsyncFunction("getX509RSASize") {(publicKeyPem: Data) in
          var publicKeySize: Int = 0
          try IdentityX509Util().getRSASize(publicKeyPem, ret0_: &publicKeySize)
          
          return publicKeySize
      }
      
      AsyncFunction("buildRegisterCertificateCallData") {(cosmosAddr: String, slavePem: Data, masterCertificatesBucketName: String, masterCertificatesFilename: String) in
          let calldataBuilder = IdentityCallDataBuilder()
          
          let calldata = try calldataBuilder.buildRegisterCertificateCalldata(
            cosmosAddr,
            slavePem: slavePem,
            masterCertificatesBucketname: masterCertificatesBucketName,
            masterCertificatesFilename: masterCertificatesFilename
          )
          
          return calldata
      }
      
      // Register certificate
      AsyncFunction("buildRegisterIdentityInputs") {(userPK: String, encapsulatedContent: Data, signedAttributes: Data, sodSignature: Data, dg1: Data, dg15: Data, pubKeyPem: Data, smtProofJsonData: Data) in
          guard let userPKData = userPK.hexadecimal else {
              throw "Invalid userPK"
          }
          
          let profile = try IdentityProfile().newProfile(userPKData)
          
          let inputs = try profile.buildRegisterIdentityInputs(
              encapsulatedContent,
              signedAttributes: signedAttributes,
              dg1: dg1,
              dg15: dg15,
              pubKeyPem: pubKeyPem,
              signature: sodSignature,
              certificatesSMTProofJSON: smtProofJsonData
          )
          
          return inputs
      }
      
      AsyncFunction("getPublicKeyHash") { (userPK: String) in
          guard let userPKData = userPK.hexadecimal else {
              throw "Invalid userPK"
          }
          
          let profile = try IdentityProfile().newProfile(userPKData)

          return try profile.getPublicKeyHash()
      }
      
      AsyncFunction("buildRegisterCallData") { (proofJson: Data, signature: Data, pubKeyPem: Data, certificatesRootRaw: Data, certificatePubKeySize: Int, isRevoced: Bool) in
          let calldataBuilder = IdentityCallDataBuilder()
          let calldata = try calldataBuilder.buildRegisterCalldata(
              proofJson,
              signature: signature,
              pubKeyPem: pubKeyPem,
              certificatesRootRaw: certificatesRootRaw,
              certificatePubKeySize: certificatePubKeySize,
              isRevoced: isRevoced
          )
      }
  }
}
