import { bus, DefaultBusEvents } from './event-bus'

export class ErrorHandler {
  static isError(error: unknown): error is Error {
    return error instanceof Error || (error instanceof Object && 'message' in error)
  }

  static process(error: unknown, message = ''): void {
    if (!ErrorHandler.isError(error)) return
    bus.emit(DefaultBusEvents.error, { message: message || error.message })
    ErrorHandler.processWithoutFeedback(error)
  }

  static processWithoutFeedback(error: unknown): void {
    if (!ErrorHandler.isError(error)) return
    console.error(error)
  }
}
