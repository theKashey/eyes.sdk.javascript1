import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'
import WebSocket from 'ws'

export interface Socket {
  connect(url: string): void
  disconnect(): void
  emit(type: string | {name: string; key: string}, payload?: Record<string, any>): () => void
  on(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void
  once(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void
  off(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): boolean
  request(name: string, payload?: any): Promise<any>
  command(name: string, fn: (payload?: any) => any): () => void
  create<TResult>(name: string, fn: (payload?: any) => TResult): PromiseLike<TResult>
  ref(): () => void
  unref(): () => void
}

export function makeSocket(ws: WebSocket, {logger}: {logger?: Logger} = {}): Socket {
  let socket: WebSocket = null
  const listeners = new Map<string, Set<(...args: any[]) => any>>()
  const queue = new Set<() => any>()

  attach(ws)

  return {
    connect,
    disconnect,
    emit,
    on,
    once,
    off,
    request,
    command,
    create,
    ref,
    unref,
  }

  function attach(ws: WebSocket) {
    if (!ws) return

    if (ws.readyState === WebSocket.CONNECTING) ws.on('open', () => attach(ws))
    else if (ws.readyState === WebSocket.OPEN) {
      socket = ws
      queue.forEach(command => command())
      queue.clear()

      socket.on('message', message => {
        const {name, key, payload} = deserialize(message as string)
        const fns = listeners.get(name)
        if (fns) fns.forEach(fn => fn(payload, key))
        if (key) {
          const fns = listeners.get(`${name}/${key}`)
          if (fns) fns.forEach(fn => fn(payload, key))
        }
      })

      socket.on('close', () => {
        const fns = listeners.get('close')
        if (fns) fns.forEach(fn => fn())
      })

      socket.on('error', error => {
        const fns = listeners.get('error')
        if (fns) fns.forEach(fn => fn(error))
      })
    }
  }

  function connect(url: string) {
    const ws = new WebSocket(url)
    attach(ws)
  }

  function disconnect() {
    if (!socket) return
    socket.terminate()
    socket = null
  }

  function emit(type: string | {name: string; key: string}, payload?: Record<string, any>): () => void {
    const command = () => socket.send(serialize(type, payload))
    if (socket) command()
    else queue.add(command)
    return () => queue.delete(command)
  }

  function on(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void {
    const name = utils.types.isString(type) ? type : `${type.name}/${type.key}`
    let fns = listeners.get(name)
    if (!fns) {
      fns = new Set()
      listeners.set(name, fns)
    }
    fns.add(fn)
    return () => off(name, fn)
  }

  function once(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void {
    const off = on(type, (...args) => (fn(...args), off()))
    return off
  }

  function off(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): boolean {
    const name = utils.types.isString(type) ? type : `${type.name}/${type.key}`
    if (!fn) return listeners.delete(name)
    const fns = listeners.get(name)
    if (!fns) return false
    const existed = fns.delete(fn)
    if (!fns.size) listeners.delete(name)
    return existed
  }

  function request(name: string, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const key = utils.general.guid()
      emit({name, key}, payload)
      once({name, key}, response => {
        if (response.error) {
          const error = new Error(response.error.message)
          error.stack = response.error.stack
          return reject(error)
        }
        return resolve(response.result)
      })
    })
  }

  function command(name: string, fn: (payload?: any) => any): () => void {
    return on(name, async (payload, key) => {
      logger?.log('[COMMAND]', name, JSON.stringify(payload, null, 4))
      try {
        const result = await fn(payload)
        emit({name, key}, {result})
      } catch (error) {
        emit({name, key}, {error: {message: error.message, stack: error.stack, reason: error.reason}})
      }
    })
  }

  function create<TResult>(name: string, fn: (payload?: any) => TResult): PromiseLike<TResult> {
    let temporary = makeState()
    let result = temporary
    on(name, async payload => {
      result = temporary
      try {
        result.resolve(await fn(payload))
      } catch (error) {
        result.reject(error)
      } finally {
        temporary = makeState()
      }
    })
    return {
      then: (onResolved, onRejected) => result.promise.then(onResolved, onRejected),
    }

    function makeState() {
      const state = {} as {promise: Promise<TResult>; resolve: (value: TResult) => void; reject: (error: Error) => void}
      state.promise = new Promise<TResult>((resolve, reject) => {
        state.resolve = resolve
        state.reject = reject
      })
      return state
    }
  }

  function ref() {
    //@ts-ignore
    const command = () => socket._socket.ref()
    if (socket) command()
    else queue.add(command)
    return () => queue.delete(command)
  }

  function unref() {
    //@ts-ignore
    const command = () => socket._socket.unref()
    if (socket) command()
    else queue.add(command)
    return () => queue.delete(command)
  }
}

function serialize(type: string | {name: string; key: string}, payload: any) {
  const message = utils.types.isString(type) ? {name: type, payload} : {name: type.name, key: type.key, payload}
  return JSON.stringify(message)
}

function deserialize(message: string) {
  return JSON.parse(message)
}
