export type LogLevelName = keyof typeof LogLevel

export enum LogLevel {
  silent = 0,
  fatal = 100,
  error = 200,
  warn = 300,
  info = 400,
  debug = 500,
  trace = 600,
  all = Number.MAX_VALUE,
}
