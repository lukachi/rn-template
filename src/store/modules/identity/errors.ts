export class CertificateAlreadyRegisteredError extends Error {
  constructor() {
    super('Certificate already registered')
  }
}
