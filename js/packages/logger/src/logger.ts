import * as utils from '@applitools/utils'
import {type Handler} from './handler'
import {type ConsoleHandler, makeConsoleHandler} from './handler-console'
import {type FileHandler, makeFileHandler} from './handler-file'
import {type RollingFileHandler, makeRollingFileHandler} from './handler-rolling-file'
import {type Printer, type PrinterOptions, makePrinter} from './printer'
import {type LogLevelName, LogLevel} from './log-level'
import {type ColoringOptions, format as defaultFormat} from './format'

export type LoggerOptions = Omit<PrinterOptions, 'handler' | 'level' | 'colors'> & {
  handler?: ConsoleHandler | FileHandler | RollingFileHandler | Handler
  level?: LogLevelName | number
  colors?: boolean | ColoringOptions
  console?: boolean | Handler
}

export type ExtendOptions = Omit<LoggerOptions, 'handler'>

export interface Logger extends Printer {
  isLogger: true
  console: Printer
  tag(name: string, value: any): void
  extend(options?: ExtendOptions): Logger
  open(): void
  close(): void
}

export function makeLogger({
  handler,
  label,
  tags,
  timestamp,
  level,
  colors,
  format = defaultFormat,
  console = true,
  extended = false,
}: LoggerOptions & {extended?: boolean} = {}): Logger {
  if (!handler) {
    if (process.env.APPLITOOLS_LOG_FILE) {
      handler = {type: 'file', filename: process.env.APPLITOOLS_LOG_FILE}
    } else if (process.env.APPLITOOLS_LOG_DIR) {
      handler = {type: 'rolling file', dirname: process.env.APPLITOOLS_LOG_DIR}
    } else {
      handler = {type: 'console'}
    }
  }

  if (!utils.types.isNumber(level)) {
    level =
      level ??
      (process.env.APPLITOOLS_LOG_LEVEL as LogLevelName) ??
      (process.env.APPLITOOLS_SHOW_LOGS === 'true' ? 'all' : 'silent')
    level = LogLevel[level] ?? LogLevel.silent
  }

  if (colors === false) {
    colors = undefined
  } else if (colors === true || process.env.APPLITOOLS_LOG_COLORS === 'true') {
    colors = {
      label: 'cyan',
      timestamp: 'greenBright',
      tags: 'blueBright',
      level: {
        info: ['bgBlueBright', 'black'],
        warn: ['bgYellowBright', 'black'],
        error: ['bgRedBright', 'white'],
        fatal: ['bgRed', 'white'],
      },
    }
  }

  if (utils.types.has(handler, 'type')) {
    if (handler.type === 'console') {
      handler = makeConsoleHandler()
    } else if (handler.type === 'file') {
      handler = makeFileHandler(handler)
      colors = undefined
    } else if (handler.type === 'rolling file') {
      handler = makeRollingFileHandler(handler)
      colors = undefined
    }
  } else if (!utils.types.isFunction(handler, 'log')) {
    throw new Error('Handler have to implement `log` method or use one of the built-in handler names under `type` prop')
  }

  const consoleHandler = console ? (utils.types.isObject(console) ? console : makeConsoleHandler()) : handler

  return {
    isLogger: true,
    console: makePrinter({handler: consoleHandler, format, prelude: false}),
    ...makePrinter({handler, format, label, tags, timestamp, level, colors: colors as ColoringOptions}),
    tag(name, value) {
      tags ??= {}
      tags[name] = value
    },
    extend(options?: ExtendOptions) {
      if (!options?.colors) {
        options.colors = options?.colors ?? colors ?? false
      } else if (colors) {
        options.colors = {...(colors as ColoringOptions), ...(options?.colors as ColoringOptions)}
      }

      return makeLogger({
        format,
        label,
        tags,
        timestamp,
        level,
        console: consoleHandler,
        ...options,
        handler,
        extended: true,
      })
    },
    open() {
      if (!extended) (handler as Handler).open?.()
    },
    close() {
      if (!extended) (handler as Handler).close?.()
    },
  }
}
