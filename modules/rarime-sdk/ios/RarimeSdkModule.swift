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
  }
}
