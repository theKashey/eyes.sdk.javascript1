import * as logger from '@applitools/logger'

export type LogHandler = CustomLogHandler | FileLogHandler | ConsoleLogHandler
export type CustomLogHandler = logger.CustomHandler
export type FileLogHandler = logger.FileHandler
export type ConsoleLogHandler = logger.ConsoleHandler

export abstract class LogHandlerData implements CustomLogHandler {
  private _verbose: boolean

  constructor(verbose = false) {
    this._verbose = verbose
  }

  get verbose() {
    return this._verbose
  }
  set verbose(verbose: boolean) {
    this._verbose = verbose
  }
  getIsVerbose(): boolean {
    return this._verbose
  }
  setIsVerbose(verbose: boolean) {
    this.verbose = verbose
  }

  log(message: string) {
    this.onMessage(message)
  }

  abstract onMessage(message: string): void

  abstract open(): void

  abstract close(): void

  /** @internal */
  toJSON(): LogHandler {
    return {
      log: this.onMessage.bind(this),
      open: this.open.bind(this),
      close: this.close.bind(this),
    }
  }
}

export class FileLogHandlerData extends LogHandlerData implements FileLogHandler {
  readonly type = 'file'
  readonly filename: string
  readonly append: boolean

  constructor(verbose?: boolean, filename = 'eyes.log', append = true) {
    super(verbose)
    this.filename = filename
    this.append = append
  }

  onMessage(): void {
    return undefined
  }

  open(): void {
    return undefined
  }

  close(): void {
    return undefined
  }

  /** @internal */
  toJSON(): LogHandler {
    return {type: this.type, filename: this.filename, append: this.append}
  }
}

export class ConsoleLogHandlerData extends LogHandlerData implements ConsoleLogHandler {
  readonly type = 'console'

  onMessage(): void {
    return undefined
  }

  open(): void {
    return undefined
  }

  close(): void {
    return undefined
  }

  /** @internal */
  toJSON(): LogHandler {
    return {type: this.type}
  }
}

export class NullLogHandlerData extends LogHandlerData {
  onMessage(): void {
    return undefined
  }

  open(): void {
    return undefined
  }

  close(): void {
    return undefined
  }

  /** @internal */
  toJSON(): LogHandler {
    return null
  }
}
