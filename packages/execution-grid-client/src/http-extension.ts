import {type Logger} from '@applitools/logger'
declare module 'http' {
  interface IncomingMessage {
    body?: Record<string, any>
    retry?: number
    logger?: Logger & any
  }

  interface ServerResponse {
    body?: Record<string, any>
  }
}
