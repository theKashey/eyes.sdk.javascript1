import {Socket, type SocketConnectOpts} from 'net'
import * as utils from '@applitools/utils'

const originalSocketConnect = Socket.prototype.connect

export function restrictNetwork(validate: (options: SocketConnectOpts) => boolean): () => void {
  Socket.prototype.connect = restrictedConnect as any
  return () => (Socket.prototype.connect = originalSocketConnect)

  function restrictedConnect(...args: Parameters<typeof Socket.prototype.connect>[]) {
    let options: SocketConnectOpts
    if (utils.types.isArray(args[0])) {
      // this is something that nodejs impl uses internally
      options = args[0][0] as any as SocketConnectOpts
    } else if (utils.types.isObject(args[0])) {
      options = args[0]
    } else if (utils.types.isString(args[0]) && !utils.types.isInteger(Number(args[0]))) {
      options = {path: args[0]}
    } else {
      options = {port: args[0], host: utils.types.isString(args[1]) ? args[1] : 'localhost'}
    }

    if (!validate(options)) {
      const error = utils.types.has(options, 'port')
        ? new Error(`Connection to tcp address ${options.host ?? 'localhost'}:${options.port} is restricted`)
        : new Error(`Connection to ipc address ${options.path} is restricted`)
      throw error
    }

    return originalSocketConnect.call(this, ...args)
  }
}
