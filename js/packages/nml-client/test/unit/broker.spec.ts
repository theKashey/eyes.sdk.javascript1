import assert from 'assert'
import {publishMessageRequest} from '../../src/broker'
import {brokerURL, fakePublishMessage, fakePollMessageResult} from '../util/fake-broker'

describe('broker', () => {
  it('publish message request', async () => {
    fakePublishMessage()
    fakePollMessageResult()
    const response = await publishMessageRequest({
      url: brokerURL,
      payload: {hello: 'world'},
    })

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('reject on error in publish message request', async () => {
    fakePublishMessage({statusCode: 404, message: 'session does not exist'})
    fakePollMessageResult()
    await assert.rejects(
      async () => {
        await publishMessageRequest({
          url: brokerURL,
          payload: {hello: 'world'},
        })
      },
      {
        message:
          'something went wrong when communicating with the mobile application, please try running your test again (error code: 404)',
      },
    )

    fakePublishMessage({statusCode: 409, message: 'a message was already posted to this id'})
    await assert.rejects(
      async () => {
        await publishMessageRequest({
          url: brokerURL,
          payload: {hello: 'world'},
        })
      },
      {
        message:
          'something went wrong when communicating with the mobile application, please try running your test again (error code: 409)',
      },
    )
  })
})
