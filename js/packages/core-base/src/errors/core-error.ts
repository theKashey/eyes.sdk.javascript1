export class CoreError extends Error {
  readonly reason: string
  readonly originalError?: Error
  readonly info?: Record<string, any>

  constructor(
    message: string,
    {reason = 'internal', error, ...info}: Record<string, any> & {reason?: string; error?: Error} = {},
  ) {
    super()
    this.name = this.constructor.name
    this.message = message
    this.reason = reason
    this.info = info
    this.originalError = error

    if (error instanceof Error) {
      this.message = `${message}: ${error.message}`
      this.stack = error.stack
    }
  }
  toJSON() {
    return {message: this.message, stack: this.stack, reason: this.reason, info: this.info}
  }
}
