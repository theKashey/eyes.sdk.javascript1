import {makeReqBroker} from '../../src/req-broker'
import {brokerURL, fakePublishMessage, fakePollMessageResult, fakeBrokerRequests} from '../util/fake-broker'
import assert from 'assert'

describe('req-broker', () => {
  it('sends request and gets response', async () => {
    fakePublishMessage()
    fakePollMessageResult()
    const req = makeReqBroker({config: {}})
    const response = await req(brokerURL, {
      name: 'test',
      body: {protocolVersion: '1.0', name: 'test', key: 'guid', payload: {}},
    })

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('rejects if initial request response with non-200 status code', async () => {
    fakePublishMessage({statusCode: 404, message: 'session does not exist'})
    const req = makeReqBroker({config: {}})
    await assert.rejects(
      req(brokerURL, {
        name: 'test',
        body: {protocolVersion: '1.0', name: 'test', key: 'guid', payload: {}},
      }),
      {
        message:
          'Something went wrong when communicating with the mobile application, please try running your test again (error code: 404)',
      },
    )

    fakePublishMessage({statusCode: 409, message: 'a message was already posted to this id'})
    await assert.rejects(
      req(brokerURL, {
        name: 'test',
        body: {protocolVersion: '1.0', name: 'test', key: 'guid', payload: {}},
      }),
      {
        message:
          'Something went wrong when communicating with the mobile application, please try running your test again (error code: 409)',
      },
    )
  })

  it('rejects if command finished with an error', async () => {
    fakeBrokerRequests({payload: {error: {message: 'message', stack: 'stack'}}})
    const req = makeReqBroker({config: {}})
    await assert.rejects(
      req(brokerURL, {
        name: 'test',
        body: {protocolVersion: '1.0', name: 'test', key: 'guid', payload: {}},
      }),
      {
        message:
          'There was a problem when interacting with the mobile application. The provided error message was "message" and had a stack trace of "stack"',
      },
    )
  })
})
