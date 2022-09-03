import {takeScreenshot, takeSnapshot} from '../../src/client'
import assert from 'assert'
import {brokerURL, fakeBrokerRequests} from '../util/fake-broker'

describe('client', () => {
  it('takeScreenshot works', async () => {
    const screenshotURL = 'http://blah'
    fakeBrokerRequests({
      payload: {
        result: {
          screenshotURL,
        },
      },
    })
    const result = await takeScreenshot(brokerURL)
    assert.deepStrictEqual(result, screenshotURL)
  })
  it('takeScreenshot on error', async () => {
    fakeBrokerRequests({
      payload: {
        error: {
          message: 'boom',
          stack: 'see line 42',
        },
      },
    })
    await assert.rejects(
      async () => {
        await takeScreenshot(brokerURL)
      },
      {
        message:
          'There was a problem when interacting with the mobile application. The provided error message was "boom" and had a stack trace of "see line 42"',
      },
    )
  })
  it('takeSnapshot works', async () => {
    const expected = {
      resourceMap: {},
      metadata: {},
    }
    fakeBrokerRequests({
      payload: {
        result: expected,
      },
    })
    const result = await takeSnapshot(brokerURL)
    assert.deepStrictEqual(result, expected)
  })
  it('takeSnapshot on error', async () => {
    fakeBrokerRequests({
      payload: {
        error: {
          message: 'boom',
          stack: 'see line 42',
        },
      },
    })
    await assert.rejects(
      async () => {
        await takeSnapshot(brokerURL)
      },
      {
        message:
          'There was a problem when interacting with the mobile application. The provided error message was "boom" and had a stack trace of "see line 42"',
      },
    )
  })
})
