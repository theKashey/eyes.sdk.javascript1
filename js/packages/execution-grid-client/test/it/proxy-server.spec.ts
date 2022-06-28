import assert from 'assert'
import nock from 'nock'
import fetch from 'node-fetch'
import {AbortController} from 'abort-controller'
import {Builder} from 'selenium-webdriver'
import {makeServer} from '../../src/proxy-server'
import * as utils from '@applitools/utils'

describe('proxy-server', () => {
  let proxy

  afterEach(async () => {
    nock.cleanAll()
    await proxy.server.close()
  })

  it('proxies webdriver requests', async () => {
    proxy = await makeServer({resolveUrls: false})

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(200, {value: {capabilities: {}, sessionId: 'session-guid'}})

    nock('https://exec-wus.applitools.com').persist().delete('/session/session-guid').reply(200, {value: null})

    const driver = await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
    await driver.quit()
  })

  it('performs retries on concurrency and availability errors', async () => {
    proxy = await makeServer({resolveUrls: false})

    let retries = 0
    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(() => {
        retries += 1
        if (retries <= 2) {
          return [
            500,
            {
              value: {
                error: 'session not created',
                message: 'Session not created',
                stacktrace: '',
                data: {appliErrorCode: retries === 1 ? 'CONCURRENCY_LIMIT_REACHED' : 'NO_AVAILABLE_DRIVER_POD'},
              },
            },
          ]
        }

        return [200, {value: {capabilities: {}, sessionId: 'session-guid'}}]
      })

    await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
  })

  it('adds `applitools:` capabilities from properties', async () => {
    proxy = await makeServer({apiKey: 'api-key', eyesServerUrl: 'http://server.url', resolveUrls: false})

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply((_url, body) => {
        const {capabilities} = body as Record<string, any>
        if (
          capabilities.alwaysMatch['applitools:apiKey'] === 'api-key' &&
          capabilities.alwaysMatch['applitools:eyesServerUrl'] === 'http://server.url'
        ) {
          return [200, {value: {capabilities: {}, sessionId: 'session-guid'}}]
        } else {
          return [
            400,
            {
              value: {
                error: 'session not created',
                message: 'Session not created',
                stacktrace: '',
                data: {appliErrorCode: 'VALIDATION_ERROR'},
              },
            },
          ]
        }
      })

    await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
  })

  it('adds `applitools:` capabilities from env variables', async () => {
    process.env.APPLITOOLS_API_KEY = 'env-api-key'
    process.env.APPLITOOLS_SERVER_URL = 'http://env-server.url'
    proxy = await makeServer({resolveUrls: false})
    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply((_url, body) => {
        const {capabilities} = body as Record<string, any>
        if (
          capabilities.alwaysMatch['applitools:apiKey'] === 'env-api-key' &&
          capabilities.alwaysMatch['applitools:eyesServerUrl'] === 'http://env-server.url'
        ) {
          return [200, {value: {capabilities: {}, sessionId: 'session-guid'}}]
        } else {
          return [
            400,
            {
              value: {
                error: 'session not created',
                message: 'Session not created',
                stacktrace: '',
                data: {appliErrorCode: 'VALIDATION_ERROR'},
              },
            },
          ]
        }
      })

    await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
  })

  it('creates new tunnel when session is successfully created', async () => {
    proxy = await makeServer({egTunnelUrl: 'http://eg-tunnel', resolveUrls: false})

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(200, {value: {capabilities: {}, sessionId: 'session-guid'}})

    let isTunnelCreated = false
    nock('http://eg-tunnel')
      .persist()
      .post('/tunnels')
      .reply(() => {
        isTunnelCreated = true
        return [201, '"tunnel-id"']
      })

    await new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
      .usingServer(proxy.url)
      .build()

    assert.strictEqual(isTunnelCreated, true)
  })

  it('fails if new tunnel was not created', async () => {
    proxy = await makeServer({egTunnelUrl: 'http://eg-tunnel', resolveUrls: false})

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(() => {
        return [200, {value: {capabilities: {}, sessionId: 'session-guid'}}]
      })

    nock('http://eg-tunnel').persist().post('/tunnels').reply(401, {message: 'UNAUTHORIZED'})

    assert.rejects(
      new Builder().withCapabilities({browserName: 'chrome', 'applitools:tunnel': true}).usingServer(proxy.url).build(),
      (err: Error) => err.message.includes('UNAUTHORIZED'),
    )
  })

  it('deletes tunnel when session is successfully deleted', async () => {
    proxy = await makeServer({egTunnelUrl: 'http://eg-tunnel', resolveUrls: false})

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(200, {value: {capabilities: {}, sessionId: 'session-guid'}})

    nock('https://exec-wus.applitools.com').persist().delete('/session/session-guid').reply(200)

    nock('http://eg-tunnel').persist().post('/tunnels').reply(201, '"tunnel-id"')

    let isTunnelDeleted = false
    nock('http://eg-tunnel')
      .persist()
      .delete('/tunnels/tunnel-id')
      .reply(() => {
        isTunnelDeleted = true
        return [200, {}]
      })

    const driver = await new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
      .usingServer(proxy.url)
      .build()

    await driver.quit()

    assert.strictEqual(isTunnelDeleted, true)
  })

  it('aborts proxy request if incoming request was aborted', async () => {
    proxy = await makeServer({resolveUrls: false})

    let count = 0
    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(() => {
        count += 1
        return [
          500,
          {
            value: {
              error: 'session not created',
              message: 'Session not created',
              stacktrace: '',
              data: {appliErrorCode: 'NO_AVAILABLE_DRIVER_POD'},
            },
          },
        ]
      })

    try {
      const controller = new AbortController()
      fetch(`${proxy.url}/session`, {
        method: 'post',
        body: JSON.stringify({capabilities: {alwaysMatch: {browserName: 'chrome'}}}),
        signal: controller.signal,
      })
      setTimeout(() => controller.abort(), 1000)
    } catch (err) {
      if (err.name !== 'AbortError') throw err
    }
    await utils.general.sleep(3000)

    assert.strictEqual(count, 1)
  })

  it.skip('queue create session requests if they need retry', async () => {
    proxy = await makeServer({resolveUrls: false})

    let runningCount = 0
    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(() => {
        if (runningCount < 2) {
          runningCount += 1
          setTimeout(() => (runningCount -= 1), 10000)
          return [200, {value: {capabilities: {}, sessionId: 'session-guid'}}]
        }
        return [
          500,
          {
            value: {
              error: 'session not created',
              message: 'Session not created',
              stacktrace: '',
              data: {appliErrorCode: 'NO_AVAILABLE_DRIVER_POD'},
            },
          },
        ]
      })

    await Promise.all(
      Array.from({length: 10}).map(async (_, _index) => {
        await new Builder().withCapabilities({browserName: 'chrome'}).usingServer(proxy.url).build()
      }),
    )
  })
})
