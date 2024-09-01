//
//  DocumentScanner.swift
//  EDocument
//
//  Created by Lukachi Sama on 27.08.2024.
//

import Foundation
import UIKit
import NFCPassportReader

struct BacKeyParameters: Codable {
    var documentNumber: String
    var dateOfBirth: String
    var dateOfExpiry: String
}

struct PersonDetails : Codable {
    var firstName: String
    var lastName: String
    var gender: String
    var passportImageRaw: String?
    var issuingAuthority: String
    var documentNumber: String
    var documentExpiryDate: String
    var dateOfBirth: String
    var nationality: String
}

struct Passport: Codable {
    var personDetails: PersonDetails
    let dg1: Data
    let dg15: Data
    let sod: Data
    let signature: Data
    let dg11: Data?
    
    var fullName: String {
        "\(personDetails.firstName) \(personDetails.lastName)"
    }

    var passportImage: UIImage? {
        guard let passportImageRaw = personDetails.passportImageRaw else {
            return nil
        }

        if let data = Data(base64Encoded: passportImageRaw, options: .ignoreUnknownCharacters) {
            return UIImage(data: data)
        } else {
            return nil
        }
    }

    var ageString: String {
        do {
            return try String(
                Calendar.current.dateComponents(
                    [.year],
                    from: DateUtil.parsePassportDate(personDetails.dateOfBirth),
                    to: Date()
                ).year!
            )
        } catch {
            return "–"
        }
    }
    
    var birthDayReadable: String {
        (try? DateUtil.parsePassportDate(personDetails.dateOfBirth).formatted(date: .numeric, time: .omitted)) ?? ""
    }
    
    var encapsulatedContentSize: Int {
        let sod = try? SOD([UInt8](self.sod))
        
        return ((try? sod?.getEncapsulatedContent())?.count ?? 0) * 8
    }
    
    var personalNumber: String {
        if let dg11Raw = dg11 {
            if dg11Raw.isEmpty {
                return ""
            }

            if let dg11 = try? DataGroup11([UInt8](dg11Raw)) {
                if let personalNumber = dg11.personalNumber {
                    return personalNumber
                }
            }
        }

        let dg1Text = dg1.utf8
             
        let personalNumberStartIndex = dg1Text.index(dg1Text.startIndex, offsetBy: 20)
        let personalNumberEndIndex = dg1Text.index(dg1Text.startIndex, offsetBy: 30)
             
        return String(dg1Text[personalNumberStartIndex ... personalNumberEndIndex])
    }
    
    func getDG15PublicKeyPEM() throws -> Data {
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

    static func fromNFCPassportModel(_ model: NFCPassportModel) -> Passport {
        let dg1 = model.getDataGroup(.DG1)?.data ?? []
        let dg11 = model.getDataGroup(.DG11)?.data ?? []
        let dg15 = model.getDataGroup(.DG15)?.data ?? []
        let sod = model.getDataGroup(.SOD)?.data ?? []
        
        // HACK: For some reason Georgian passports have the first name and last name
        // joined together in the last name field
        let nameParts = model.lastName.components(separatedBy: " ")
        let hasJoinedName = model.firstName.isEmpty && nameParts.count == 2
        
        let personDetails = PersonDetails(
            firstName: hasJoinedName ? nameParts[0] : model.firstName,
            lastName: hasJoinedName ? nameParts[1] : model.lastName,
            gender: model.gender,
            passportImageRaw: model.passportImage?
                .pngData()?
                .base64EncodedString(options: .endLineWithLineFeed),
            issuingAuthority: model.issuingAuthority,
            documentNumber: model.documentNumber,
            documentExpiryDate: model.documentExpiryDate,
            dateOfBirth: model.dateOfBirth,
            nationality: model.nationality
        )
        
        return Passport(
            personDetails: personDetails,
            dg1: Data(dg1),
            dg15: Data(dg15),
            sod: Data(sod),
            signature: Data(model.activeAuthenticationSignature),
            dg11: Data(dg11)
        )
    }
    
    func serialize() throws -> Data {
        let encoder = JSONEncoder()
        return try encoder.encode(self)
    }
}

extension Passport {
    static let sample = Passport(
        personDetails: PersonDetails(
            firstName: "Zurab",
            lastName: "Gelashvili",
            gender: "M",
            passportImageRaw: nil,
            issuingAuthority: "GEO",
            documentNumber: "00AA00000",
            documentExpiryDate: "900314",
            dateOfBirth: "970314",
            nationality: "GEO"
        ),
        dg1: Data(),
        dg15: Data(),
        sod: Data(),
        signature: Data(),
        dg11: Data()
    )
}

class PassportUtils {
    static func getMRZKey(passportNumber: String, dateOfBirth: String, dateOfExpiry: String) -> String {
        let pptNr = pad(passportNumber, fieldLength: 9)
        let dob = pad(dateOfBirth, fieldLength: 6)
        let exp = pad(dateOfExpiry, fieldLength: 6)
        
        let passportNrChksum = calcCheckSum(pptNr)
        let dateOfBirthChksum = calcCheckSum(dob)
        let expiryDateChksum = calcCheckSum(exp)
        
        let mrzKey = "\(pptNr)\(passportNrChksum)\(dob)\(dateOfBirthChksum)\(exp)\(expiryDateChksum)"
        
        return mrzKey
    }
    
    private static func pad(_ value: String, fieldLength: Int) -> String {
        let paddedValue = (value + String(repeating: "<", count: fieldLength)).prefix(fieldLength)
        return String(paddedValue)
    }
    
    private static func calcCheckSum(_ checkString: String) -> Int {
        var sum = 0
        var m = 0
        let multipliers: [Int] = [7, 3, 1]
        for c in checkString {
            guard let lookup = checkSumCoderDict["\(c)"],
                  let number = Int(lookup) else { return 0 }
            let product = number * multipliers[m]
            sum += product
            m = (m + 1) % 3
        }
        
        return sum % 10
    }
}

private let checkSumCoderDict = [
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "<": "0",
    " ": "0",
    "A": "10",
    "B": "11",
    "C": "12",
    "D": "13",
    "E": "14",
    "F": "15",
    "G": "16",
    "H": "17",
    "I": "18",
    "J": "19",
    "K": "20",
    "L": "21",
    "M": "22",
    "N": "23",
    "O": "24",
    "P": "25",
    "Q": "26",
    "R": "27",
    "S": "28",
    "T": "29",
    "U": "30",
    "V": "31",
    "W": "32",
    "X": "33",
    "Y": "34",
    "Z": "35"
]

enum DateParseError: Error {
    case invalidFormat
}

class DateUtil {
    static let passportDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyMMdd"
        formatter.timeZone = .gmt
        return formatter
    }()

    static let mdyDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "MM/dd/yyyy"
        formatter.timeZone = .gmt
        return formatter
    }()

    static let richDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "dd MMM, yyyy"
        formatter.timeZone = .gmt
        return formatter
    }()

    static let mrzDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "dd/MM/yy"
        formatter.timeZone = .gmt
        return formatter
    }()

    static func parsePassportDate(_ value: String) throws -> Date {
        guard let date = passportDateFormatter.date(from: value) else {
            throw DateParseError.invalidFormat
        }

        return date
    }

    static func formatDuration(_ seconds: UInt) -> String {
        let SECONDS_IN_MINUTE: UInt = 60
        let SECONDS_IN_HOUR: UInt = 3600
        let SECONDS_IN_DAY: UInt = 86400

        let days = seconds / SECONDS_IN_DAY
        let hours = (seconds % SECONDS_IN_DAY) / SECONDS_IN_HOUR
        let minutes = (seconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE
        let seconds = seconds % SECONDS_IN_MINUTE

        if days > 0 {
            return days == 1
                ? String(localized: "1 day")
                : String(localized: "\(days) days")
        }

        var result = ""
        if hours > 0 {
            result += String(localized: "\(hours)h ")
        }

        if minutes > 0 {
            result += String(localized: "\(minutes)m ")
        }

        if seconds > 0 {
            result += String(localized: "\(seconds)s")
        }

        return result
    }
}

extension Data {
    var utf8: String {
        String(data: self, encoding: .utf8) ?? ""
    }
}

extension String: Error {}

extension String: LocalizedError {
    public var errorDescription: String? {
        return self
    }
}
