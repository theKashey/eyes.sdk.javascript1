export type DebugScreenshotHandler = {
  save: boolean
  path?: string
  prefix?: string
}

export type CustomLogHandler = {
  log(message: any): void
  warn?(message: any): void
  error?(message: any): void
  fatal?(message: any): void
  open?(): void
  close?(): void
}

export type FileLogHandler = {
  type: 'file'
  filename?: string
  append?: boolean
}

export type ConsoleLogHandler = {
  type: 'console'
}

export type LogHandler = CustomLogHandler | FileLogHandler | ConsoleLogHandler

export type Logger = {
  log(...messages: any[]): void
  warn(...messages: any[]): void
  error(...messages: any[]): void
  fatal(...messages: any[]): void
  console: {
    log(...messages: any[]): void
    warn(...messages: any[]): void
    error(...messages: any[]): void
    fatal(...messages: any[]): void
  }
  extend(...options: any): Logger
  open(): void
  close(): void
}
