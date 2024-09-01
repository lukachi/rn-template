export enum CircuitType {
  RegisterIdentityUniversalRSA2048 = 'registerIdentityUniversalRSA2048',
  RegisterIdentityUniversalRSA4096 = 'registerIdentityUniversalRSA4096',
}

export enum EDocumentModuleEvents {
  ScanStarted = 'SCAN_STARTED',
  RequestPresentPassport = 'REQUEST_PRESENT_PASSPORT',
  AuthenticatingWithPassport = 'AUTHENTICATING_WITH_PASSPORT',
  ReadingDataGroupProgress = 'READING_DATA_GROUP_PROGRESS',
  ActiveAuthentication = 'ACTIVE_AUTHENTICATION',
  SuccessfulRead = 'SUCCESSFUL_READ',
  ScanError = 'SCAN_ERROR',
  ScanStopped = 'SCAN_STOPPED',
}
