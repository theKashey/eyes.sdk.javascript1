import * as utils from '@applitools/utils'

export function makeMessenger({ sendMessage, onMessage }) {
  const messengerId = utils.general.guid()
  const listeners = new Map()

  onMessage(({ name, key, from, payload }, ...rest) => {
    if (from === messengerId) return
    const fns = []

    const unnamedFns = listeners.get('*')
    if (unnamedFns) fns.push(...unnamedFns)

    const namedFns = listeners.get(name)
    if (namedFns) fns.push(...namedFns)

    if (key) {
      const keyedFns = listeners.get(`${name}/${key}`)
      if (keyedFns) fns.push(...keyedFns)
    }

    fns.forEach(fn => fn(payload, key ? { name, key } : name, ...rest))
  })

  return {
    emit,
    on,
    once,
    off,
    request,
    command,
  }

  function emit(type, payload, ...rest) {
    const message = utils.types.isString(type)
      ? { name: type, from: messengerId, payload }
      : { name: type.name, key: type.key, from: messengerId, payload }
    sendMessage(message, ...rest)
  }

  function on(type, fn) {
    const name = utils.types.isString(type) ? type : `${type.name}/${type.key}`
    let fns = listeners.get(name)
    if (!fns) {
      fns = new Set()
      listeners.set(name, fns)
    }
    fns.add(fn)
    return () => off(name, fn)
  }

  function once(type, fn) {
    const off = on(type, (...args) => (fn(...args), off()))
    return off
  }

  function off(type, fn) {
    const name = utils.types.isString(type) ? type : `${type.name}/${type.key}`
    if (!fn) return listeners.delete(name)
    const fns = listeners.get(name)
    if (!fns) return false
    const existed = fns.delete(fn)
    if (!fns.size) listeners.delete(name)
    return existed
  }

  function request(name, payload, ...rest) {
    return new Promise((resolve, reject) => {
      const key = utils.general.guid()
      emit({ name, key }, payload, ...rest)
      once({ name, key }, response => {
        if (response.error) {
          const error = new Error(response.error.message)
          error.stack = response.error.stack
          reject(error)
        } else {
          resolve(response.result)
        }
      })
    })
  }

  function command(name, fn) {
    if (!fn) {
      fn = name
      name = '*'
    }
    return on(name, async (payload, type, ...rest) => {
      try {
        const result =
          name === '*'
            ? await fn(utils.types.isString(type) ? type : type.name, payload, ...rest)
            : await fn(payload, ...rest)
        emit(type, { result }, ...rest)
      } catch (error) {
        emit(type, { error: { message: error.message, stack: error.stack } }, ...rest)
      }
    })
  }
}
