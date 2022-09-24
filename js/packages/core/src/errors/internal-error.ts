import {CoreError} from '@applitools/core-base'

export class InternalError extends CoreError {
  constructor(error: Error & {info?: Record<string, any>}) {
    super(error.message, {reason: 'internal', ...error.info})
    this.stack = error.stack
  }
}
