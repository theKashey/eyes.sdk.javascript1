import assert from 'assert'
import EventEmitter from 'events'
import {makeSocket} from '../../src/socket'
import WebSocket from 'ws'

describe('socket', () => {
  it('responds with internal error', async () => {
    const client = makeFakeWS()
    const socket = makeSocket(client)
    socket.command('Test.throwError', () => {
      throw new Error('Internal error message')
    })

    client.incomingMessage({name: 'Test.throwError'})
    await client.outgoingMessage(({payload}) => {
      assert.strictEqual(payload.error.message, 'Internal error message')
      assert.strictEqual(payload.error.reason, 'internal')
    })
  })

  it('responds with serialized error', async () => {
    const client = makeFakeWS()
    const socket = makeSocket(client)
    socket.command('Test.throwError', () => {
      const error: any = new Error('Serializable error with additional data')
      error.toJSON = () => ({reason: 'serialized reason', info: {additional: {data: 'here'}}})
      throw error
    })

    client.incomingMessage({name: 'Test.throwError'})
    await client.outgoingMessage(({payload}) => {
      assert.strictEqual(payload.error.message, 'Serializable error with additional data')
      assert.strictEqual(payload.error.reason, 'serialized reason')
      assert.deepStrictEqual(payload.error.info, {additional: {data: 'here'}})
    })
  })
})

function makeFakeWS(): WebSocket & {
  incomingMessage(message: any): void
  outgoingMessage(handler: (message: any) => any): Promise<any>
} {
  const emitter: any = new EventEmitter()
  emitter.readyState = WebSocket.OPEN
  emitter.send = (data: any) => process.nextTick(() => emitter.emit('sent', data))

  emitter.incomingMessage = message => emitter.emit('message', JSON.stringify(message))
  emitter.outgoingMessage = handler => {
    return new Promise((resolve, reject) => {
      emitter.on('sent', async message => {
        try {
          const data = JSON.parse(message)
          resolve((await handler(data)) ?? data)
        } catch (err) {
          reject(err)
        }
      })
    })
  }
  return emitter
}
