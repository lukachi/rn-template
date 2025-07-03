import Foundation

public enum SwoirBackendError: Error, Equatable {
    case errorProving(String)
    case errorVerifying(String)
    case errorExecuting(String)
    case networkError(String)
    case memoryLimitExceeded
    case invalidBytecode
    case emptyBytecode
    case emptyWitnessMap
    case emptyProofData
    case emptyVerificationKey
    case emptyProofType
    case errorSettingUpSRS
}

public struct Proof {
    public let proof: Data
    public let vkey: Data

    public init(proof: Data, vkey: Data) {
        self.proof = proof
        self.vkey = vkey
    }
}

public protocol SwoirBackendProtocol {
    static func setup_srs(bytecode: Data, srs_path: String?, recursive: Bool) throws -> UInt32
    static func prove(bytecode: Data, witnessMap: [String], proof_type: String, recursive: Bool) throws -> Proof
    static func verify(proof: Proof, proof_type: String) throws -> Bool
    static func execute(bytecode: Data, witnessMap: [String]) throws -> [String]
}
