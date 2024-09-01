import ExpoModulesCore
import NFCPassportReader

enum DocumentScanEvents: String {
    case scanStarted = "SCAN_STARTED"
    
    case requestPresentPassport = "REQUEST_PRESENT_PASSPORT"
    case authenticatingWithPassport = "AUTHENTICATING_WITH_PASSPORT"
    case readingDataGroupProgress = "READING_DATA_GROUP_PROGRESS"
    case activeAuthentication = "ACTIVE_AUTHENTICATION"
    case successfulRead = "SUCCESSFUL_READ"
    case scanError = "SCAN_ERROR"
    
    case scanStopped = "SCAN_STOPPED"
}

public class EDocumentModule: Module {

    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    public func definition() -> ModuleDefinition {
        Events(
            DocumentScanEvents.scanStarted.rawValue,

            DocumentScanEvents.requestPresentPassport.rawValue,
            DocumentScanEvents.authenticatingWithPassport.rawValue,
            DocumentScanEvents.readingDataGroupProgress.rawValue,
            DocumentScanEvents.activeAuthentication.rawValue,
            DocumentScanEvents.successfulRead.rawValue,
            DocumentScanEvents.scanError.rawValue,

            DocumentScanEvents.scanStopped.rawValue
        )
        
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('EDocument')` in JavaScript.
        Name("EDocument")
        
        // Defines a JavaScript function that always returns a Promise and whose native code
        // is by default dispatched on the different thread than the JavaScript runtime runs on.
        AsyncFunction("scanDocument") { (bacKeyParametersJson: String, challenge: Data) in
            let bacKeyParameters = try JSONDecoder().decode(BacKeyParameters.self, from: bacKeyParametersJson.data(using: .utf8)!)
            
            let mrzKey = PassportUtils.getMRZKey(passportNumber: bacKeyParameters.documentNumber, dateOfBirth: bacKeyParameters.dateOfBirth, dateOfExpiry: bacKeyParameters.dateOfExpiry)
            
            do {
                let nfcPassport = try await PassportReader()
                    .readPassport(
                        mrzKey: mrzKey,
                        tags: [.DG1, .DG2, .DG11, .DG15, .SOD],
                        customDisplayMessage: { displayMessage in
                            // Forked from NFCViewDisplayMessage
                            func drawProgressBar(_ progress: Int) -> String {
                                let itemsCount = (progress / 20)
                                let full = String(repeating: "🟢 ", count: itemsCount)
                                let empty = String(repeating: "⚪️ ", count: 5 - itemsCount)
                                return "\(full)\(empty)"
                            }
                            
                            let message: LocalizedStringResource?
                            switch displayMessage {
                            case .requestPresentPassport:
                                self.sendEvent(DocumentScanEvents.scanStarted.rawValue)
                                self.sendEvent(DocumentScanEvents.requestPresentPassport.rawValue)
                                message = "Hold your iPhone near an NFC enabled passport.\n";
                            case .authenticatingWithPassport(let progress):
                                self.sendEvent(DocumentScanEvents.authenticatingWithPassport.rawValue)
                                message = "Authenticating with passport...\n\n\(drawProgressBar(progress))"
                            case .activeAuthentication:
                                self.sendEvent(DocumentScanEvents.activeAuthentication.rawValue)
                                message = "Authenticating with passport..."
                            case .readingDataGroupProgress(let dataGroup, let progress):
                                self.sendEvent(DocumentScanEvents.readingDataGroupProgress.rawValue)
                                message = "Reading passport data (\(dataGroup.getName()))...\n\n\(drawProgressBar(progress))"
                            case .error(let tagError):
                                self.sendEvent(DocumentScanEvents.scanError.rawValue)
                                switch tagError {
                                case .TagNotValid: message = "Tag not valid."
                                case .MoreThanOneTagFound: message = "More than 1 tag was found. Please present only 1 tag."
                                case .ConnectionError: message = "Connection error. Please try again."
                                case .InvalidMRZKey: message = "MRZ Key not valid for this document."
                                case .ResponseError(let reason, let sw1, let sw2):
                                    message = "Sorry, there was a problem reading the passport. \(reason). Error codes: [0x\(sw1), 0x\(sw2)]"
                                default: message = "Sorry, there was a problem reading the passport. Please try again"
                                }
                            case .successfulRead:
                                self.sendEvent(DocumentScanEvents.successfulRead.rawValue)
                                message = "Passport read successfully"
                            }
                            
                            return message == nil ? nil : String(localized: message!)
                        },
                        activeAuthenticationChallenge: [UInt8](challenge)
                    )
                
                let passport = Passport.fromNFCPassportModel(nfcPassport)
                
                let passportJsonBytes = try passport.serialize()
                
                return String(data: passportJsonBytes, encoding: .utf8)!
            } catch {
                self.sendEvent(DocumentScanEvents.scanError.rawValue)
                throw error.localizedDescription
            }
        }
        
        AsyncFunction("disableScan") {
            // TODO: implement
            sendEvent(DocumentScanEvents.scanStopped.rawValue)
            throw "Not implemented"
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
        
        AsyncFunction("getSodEncapsulatedContent"){(sod: Data) in
            let sod = try sodFrom(sod)
            
            return try sod.getEncapsulatedContent()
        }

        AsyncFunction("getSodSignedAttributes"){(sod: Data) in
            let sod = try sodFrom(sod)
            
            return try sod.getSignedAttributes()
        }

        AsyncFunction("getSodSignature"){(sod: Data) in
            let sod = try sodFrom(sod)
            
            return try sod.getSignature()
        }
        
        AsyncFunction("getDG15PubKeyPem") { (dg15: Data) in
            if dg15.isEmpty {
                return Data()
            }
            
            guard let dg15 = try? DataGroup15([UInt8](dg15)) else {
                return Data()
            }
            
            var pubkey: OpaquePointer
            if let rsaPublicKey = dg15.rsaPublicKey {
                pubkey = rsaPublicKey
            } else if let ecdsaPublicKey = dg15.ecdsaPublicKey {
                pubkey = ecdsaPublicKey
            } else {
                throw "Public key is missing"
            }
            
            guard let pubKeyPem = OpenSSLUtils.pubKeyToPEM(pubKey: pubkey).data(using: .utf8) else {
                throw "Failed to convert public key to PEM"
            }
            
            return pubKeyPem
        }
    }
    
    private func sodFrom(_ sod: Data) throws -> SOD {
        return try SOD([UInt8](sod))
    }
}
