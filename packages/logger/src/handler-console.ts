import {type Handler} from './handler'

export type ConsoleHandler = {
  type: 'console'
}

export function makeConsoleHandler(): Handler {
  return {log, warn, error}

  function log(message: string) {
    console.log(message)
  }

  function warn(message: string) {
    console.warn(message)
  }

  function error(message: string) {
    console.error(message)
  }
}
