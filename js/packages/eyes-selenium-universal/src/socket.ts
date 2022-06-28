import * as utils from '@applitools/utils'
import WebSocket from 'ws'

export class Socket {
  private _socket: WebSocket = null
  private _waiter: Waiter = null
  private _listeners = new Map<string, Set<(...args: any[]) => any>>()
  private _queue = new Set<() => any>()
  private _refed = true

  private _ref() {
    //@ts-ignore
    const command = () => this._socket._socket.ref()
    if (this._socket?.readyState === WebSocket.OPEN) command()
    else this._queue.add(command)
    return () => this._queue.delete(command)
  }

  private _unref() {
    //@ts-ignore
    const command = () => this._socket._socket.unref()
    if (this._socket?.readyState === WebSocket.OPEN) command()
    else this._queue.add(command)
    return () => this._queue.delete(command)
  }

  connect(url: string): void {
    this._socket = new WebSocket(url)
    this._socket.on('open', () => {
      this._queue.forEach(command => command())
      this._queue.clear()

      this._socket.on('message', (message: string) => {
        const {name, key, payload} = JSON.parse(message)
        const fns = this._listeners.get(name)
        if (fns) fns.forEach(fn => fn(payload, key))
        if (key) {
          const fns = this._listeners.get(`${name}/${key}`)
          if (fns) fns.forEach(fn => fn(payload, key))
        }
      })
    })

    this._socket.on('close', () => {
      const fns = this._listeners.get('close')
      if (fns) fns.forEach(fn => fn())
    })

    this._socket.on('error', error => {
      const fns = this._listeners.get('error')
      if (fns) fns.forEach(fn => fn(error))
    })

    // TODO timeout and reject
  }

  emit(name: string, payload?: Record<string, any>, key?: string): () => void {
    const command = () => this._socket.send(JSON.stringify({name, key, payload}))
    if (this._socket?.readyState === WebSocket.OPEN) command()
    else this._queue.add(command)
    return () => this._queue.delete(command)
  }

  on(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void {
    const name = utils.types.isString(type) ? type : `${type.name}/${type.key}`
    let fns = this._listeners.get(name)
    if (!fns) {
      fns = new Set()
      this._listeners.set(name, fns)
    }
    fns.add(fn)
    return () => this.off(name, fn)
  }

  once(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void {
    const off = this.on(type, (...args) => (fn(...args), off()))
    return off
  }

  off(name: string, fn: (payload?: any, key?: string) => any): boolean {
    if (!fn) return this._listeners.delete(name)
    const fns = this._listeners.get(name)
    if (!fns) return false
    const existed = fns.delete(fn)
    if (!fns.size) this._listeners.delete(name)
    return existed
  }

  request(name: string, payload?: any): Promise<any> {
    const request = new Promise((resolve, reject) => {
      const key = utils.general.guid()
      this.emit(name, payload, key)
      this.once({name, key}, response => {
        if (response.error) {
          const error = new Error(response.error.message)
          error.stack = response.error.stack
          return reject(error)
        }
        return resolve(response.result)
      })
    })

    if (!this._refed) {
      this._ref()
      this._waiter ??= new Waiter(() => this._unref())
      this._waiter.wait(request)
    }

    return request
  }

  command(name: string, fn: (payload?: any) => any): () => void {
    return this.on(name, async (payload, key) => {
      try {
        // console.log(`${chalk.yellow('[COMMAND]')} ${name}, ${key}, ${JSON.stringify(payload, null, 2)}`)
        const result = await fn(payload)
        this.emit(name, {result}, key)
      } catch (error) {
        // console.log(`${chalk.red('[COMMAND]')} ${name} ${key} ${error}`)
        // console.log(error)
        this.emit(name, {error: {message: error.message, stack: error.stack}}, key)
      }
    })
  }

  ref(): () => void {
    this._refed = true
    return this._ref()
  }

  unref(): () => void {
    this._refed = false
    return this._unref()
  }
}

class Waiter {
  private _count = 0

  constructor(private _callback: () => void) {}

  wait(promise: Promise<any>): () => void {
    let canceled = false
    ++this._count
    promise.finally(() => !canceled && --this._count === 0 && this._callback())
    return () => {
      canceled = true
      --this._count
    }
  }
}
