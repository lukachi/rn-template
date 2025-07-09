#if targetEnvironment(simulator)
#else

import Foundation

public extension RustVec where T == Int32 {
    convenience init(from swiftArray: [Int32]) {
        self.init()
        for element in swiftArray {
            self.push(value: element)
        }
    }
}

public extension RustVec where T == Int64 {
    convenience init(from swiftArray: [Int64]) {
        self.init()
        for element in swiftArray {
            self.push(value: element)
        }
    }
}

public extension RustVec where T == UInt8 {
    convenience init(from data: Data) {
        self.init()
        for byte in data {
            self.push(value: byte)
        }
    }
}

extension RustVec where T == UInt8 {
    func toData() -> Data {
        let baseAddress = self.as_ptr()
        let length = self.len()
        if length > 0 {
            return Data(bytes: baseAddress, count: length)
        } else {
            return Data()
        }
    }
}

#endif
