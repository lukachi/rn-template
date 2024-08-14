import ExpoModulesCore
import rapidsnark

typealias PubSignals = [String]

struct Proof: Codable {
    let piA: [String]
    let piB: [[String]]
    let piC: [String]
    let proofProtocol: String

    enum CodingKeys: String, CodingKey {
        case piA = "pi_a"
        case piB = "pi_b"
        case piC = "pi_c"
        case proofProtocol = "protocol"
    }
}

struct ZkProof: Codable {
    let proof: Proof
    let pubSignals: PubSignals

    enum CodingKeys: String, CodingKey {
        case proof
        case pubSignals = "pub_signals"
    }
}

enum RapidsnarkUtilsError: Error {
    case invalidBase64String
    case zkProofError(String)
}

func base64StringToData(_ base64String: String) -> Data? {
    return Data(base64Encoded: base64String)
}

public class RapidsnarkWrpModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('RapidsnarkWrp')` in JavaScript.
    Name("RapidsnarkWrp")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
      AsyncFunction("groth16Prove") { (wtnsBase64: String, zkeyBase64: String) in
          do {
              guard let decodedWtnsData = base64StringToData(wtnsBase64),
                    let decodedZKeyData = base64StringToData(zkeyBase64) else {
                  throw RapidsnarkUtilsError.invalidBase64String;
              }
  
              let (proof, inputs) = try rapidsnark.groth16Prove(zkey: decodedZKeyData, witness: decodedWtnsData)

              // Convert proof string to Data
              guard let proofData = proof.data(using: .utf8),
                    let inputsData = inputs.data(using: .utf8) else {
                  throw RapidsnarkUtilsError.zkProofError("Failed to convert proof or inputs to Data")
              }
              
              // Log the proofData to verify it
              if let proofString = String(data: proofData, encoding: .utf8) {
                  print("Proof Data: \(proofString)")
              }
              
              if let inputsString = String(data: inputsData, encoding: .utf8) {
                  print("Inputs Data: \(inputsString)")
              }
              
              // Parse JSON directly from the UTF-8 string
              let proofJson = try JSONDecoder().decode(Proof.self, from: proofData)
              
              let pubSignalsJson = try JSONDecoder().decode(PubSignals.self, from: inputsData)

              let zkProof = ZkProof(proof: proofJson, pubSignals: pubSignalsJson)
  
              let result = try JSONEncoder().encode(zkProof).base64EncodedString()
  
              return result
          } catch {
              throw RapidsnarkUtilsError.zkProofError("error.localizedDescription")
          }
      }
  }
}
