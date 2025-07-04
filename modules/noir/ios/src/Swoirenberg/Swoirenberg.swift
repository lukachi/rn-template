import Foundation

public class Swoirenberg: SwoirCore.SwoirBackendProtocol {
    public static func setup_srs(bytecode: Data, srs_path: String? = nil, recursive: Bool = false) throws -> UInt32 {
        #if targetEnvironment(simulator)
        throw SwoirBackendError.errorExecuting("simulator")
        #else

      if bytecode.isEmpty { throw SwoirCore.SwoirBackendError.emptyBytecode }
        let bytecodeBase64 = bytecode.base64EncodedString()
        guard let result = setup_srs_swift(bytecodeBase64, srs_path, recursive) else {
          throw SwoirCore.SwoirBackendError.errorSettingUpSRS
        }
        return result
        #endif
    }

    public static func prove(bytecode: Data, witnessMap: [String], proof_type: String, recursive: Bool) throws -> SwoirCore.Proof {
        #if targetEnvironment(simulator)
        throw SwoirCore.SwoirBackendError.errorExecuting("simulator")
        #else

        if bytecode.isEmpty { throw SwoirCore.SwoirBackendError.emptyBytecode }
        if witnessMap.isEmpty { throw SwoirCore.SwoirBackendError.emptyWitnessMap }
        let bytecodeBase64 = bytecode.base64EncodedString()
        let witnessMapRustVec = RustVec<RustString>()
        for witness in witnessMap {
            witnessMapRustVec.push(value: witness.intoRustString())
        }

        guard let proofResult = prove_swift(bytecodeBase64.intoRustString(), witnessMapRustVec, proof_type.intoRustString(), recursive) else {
          throw SwoirCore.SwoirBackendError.errorProving("Error generating proof")
        }
        let proof = SwoirCore.Proof(
            proof: Data(bytes: proofResult.proof_data_ptr(), count: Int(proofResult.proof_data_len())),
            vkey: Data(bytes: proofResult.vkey_data_ptr(), count: Int(proofResult.vkey_data_len())))
        return proof

        #endif
    }

    public static func get_verification_key(bytecode: Data) throws -> String {
        #if targetEnvironment(simulator)
        throw SwoirCore.SwoirBackendError.errorExecuting("simulator")
        #else

        if bytecode.isEmpty { throw SwoirCore.SwoirBackendError.emptyBytecode }

        let bytecodeBase64 = bytecode.base64EncodedString()

        guard let keyResult = get_verification_key_swift(bytecodeBase64.intoRustString()) else {
          throw SwoirCore.SwoirBackendError.errorProving("Error generating verification key")
        }

        return keyResult.as_str().toString()

        #endif
    }

    public static func verify(proof: SwoirCore.Proof, proof_type: String) throws -> Bool {
        #if targetEnvironment(simulator)
        throw SwoirCore.SwoirBackendError.errorExecuting("simulator")
        #else

        if proof.proof.isEmpty { throw SwoirCore.SwoirBackendError.emptyProofData }
        if proof.vkey.isEmpty { throw SwoirCore.SwoirBackendError.emptyVerificationKey }

        let verified = verify_swift(RustVec<UInt8>(from: proof.proof), RustVec<UInt8>(from: proof.vkey), proof_type) ?? false
        return verified

        #endif
    }

    public static func execute(bytecode: Data, witnessMap: [String]) throws -> [String] {
        #if targetEnvironment(simulator)
        throw SwoirBackendError.errorExecuting("simulator")
        #else

        if bytecode.isEmpty { throw SwoirCore.SwoirBackendError.emptyBytecode }
        if witnessMap.isEmpty { throw SwoirCore.SwoirBackendError.emptyWitnessMap }
        let bytecodeBase64 = bytecode.base64EncodedString()
        let witnessMapRustVec = RustVec<RustString>()
        for witness in witnessMap {
            witnessMapRustVec.push(value: witness.intoRustString())
        }

        guard let witnessResult = execute_swift(bytecodeBase64.intoRustString(), witnessMapRustVec) else {
          throw SwoirCore.SwoirBackendError.errorExecuting("Error executing circuit")
        }
        return witnessResult.map { $0.as_str().toString() }

        #endif
    }
}
