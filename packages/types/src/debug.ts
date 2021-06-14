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
