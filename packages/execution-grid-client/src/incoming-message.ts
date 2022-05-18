import {type IncomingMessage} from 'http'

export type ModifiedIncomingMessage = IncomingMessage & {
  body(): Promise<Buffer>
  json(): Promise<Record<string, any>>
}

export function modifyIncomingMessage(message: IncomingMessage): ModifiedIncomingMessage {
  let buffer: Promise<Buffer>

  const modifiedMessage = Object.create(message) as ModifiedIncomingMessage
  modifiedMessage.body = async function body() {
    buffer ??= readStream(message)
    return buffer
  }
  modifiedMessage.json = async function json() {
    try {
      buffer ??= readStream(message)
      return JSON.parse((await buffer).toString('utf8'))
    } catch {
      return null
    }
  }
  modifiedMessage.pipe = function pipe(destination, options) {
    if (!buffer) {
      buffer = readStream(message)
      return message.pipe(destination, options)
    }
    buffer.then(buffer => {
      destination.write(buffer)
      if (options?.end !== false) destination.end()
    })
    return destination
  }
  return modifiedMessage

  function readStream(message: IncomingMessage) {
    return new Promise<Buffer>((resolve, reject) => {
      let ended = false
      const chunks = [] as Buffer[]

      message.on('data', onData)
      message.on('end', onEnd)
      message.on('error', onEnd)
      message.on('aborted', onAbort)
      message.on('close', onCleanup)

      function onData(chunk: Buffer) {
        chunks.push(chunk)
      }
      function onEnd(err: Error) {
        if (err) return reject(err)
        ended = true
        resolve(Buffer.concat(chunks))
      }
      function onAbort() {
        if (!ended) reject(new Error('Cannot collect message data due to it being closed before ended'))
      }
      function onCleanup() {
        message.off('data', onData)
        message.off('end', onEnd)
        message.off('error', onEnd)
        message.off('aborted', onAbort)
        message.off('close', onCleanup)
      }
    })
  }
}
