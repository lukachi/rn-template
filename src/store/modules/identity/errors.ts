export class CertificateAlreadyRegisteredError extends Error {
  constructor() {
    super('Certificate already registered')
  }
}

export class PassportRegisteredWithAnotherPKError extends Error {
  constructor() {
    super('Passport registered with another public key')
  }
}
