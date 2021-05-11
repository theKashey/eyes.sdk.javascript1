export default function makeLogger(options?: LoggerOptions): Logger;

export interface Logger extends Printer<Omit<FormatOptions, 'timestamp' | 'level'>> {
  isLogger: true
  console: Printer<{color: Style | Style[]}>
  // format(strings: TemplateStringsArray, ...data: any[]): string
  extend(label?: string, color?: Style | Style[]): Logger
  open(): void
  close(): void
}

export interface Printer<TPrinterOptions> {
  log(message: any, options?: TPrinterOptions): void
  warn(message: any, options?: TPrinterOptions): void
  error(message: any, options?: TPrinterOptions): void
  fatal(message: any, options?: TPrinterOptions): void
}

export type LoggerOptions = {
  handler?: ConsoleHandler | FileHandler | CustomHandler
  format?: (message: any, options: FormatOptions) => string
  label?: string
  timestamp?: false
  level?: LogLevels | number
  colors?: boolean | ColoringOptions
  console?: boolean
}

export type FormatOptions = {
  formatting?: boolean
  label?: string
  timestamp?: Date,
  level?: LogLevels
  tags?: Record<string, unknown>
  color?: Style | Style[]
  colors?: ColoringOptions
}

export type ColoringOptions = {
  timestamp?: Style | Style[]
  level?: {
    [key in LogLevels]?: Style | Style[]
  },
  tags?: Style | Style[]
  message?: Style | Style[]
}

export type CustomHandler = {
  log(message: any): void
  warn?(message: any): void
  error?(message: any): void
  fatal?(message: any): void
  open?(): void
  close?(): void
}

export type FileHandler = {
  type: 'file'
  filename?: string
  append?: boolean
}

export type ConsoleHandler = {
  type: 'console'
}

export type LogLevels = 'silent' | 'fatal' | 'error' | 'warn' | 'info'

export type Style = string