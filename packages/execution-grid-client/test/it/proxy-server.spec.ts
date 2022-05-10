import assert from 'assert'
import nock from 'nock'
import {Builder} from 'selenium-webdriver'
import {makeServer} from '../../src/proxy-server'

describe('proxy-server', () => {
  let proxy

  afterEach(async () => {
    nock.cleanAll()
    await proxy.server.close()
  })

  it('proxies webdriver requests', async () => {
    proxy = await makeServer()

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(200, {value: {capabilities: {}, sessionId: 'session-guid'}})

    nock('https://exec-wus.applitools.com').persist().delete('/session/session-guid').reply(200, {value: null})

    const driver = await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
    await driver.quit()
  })

  it('performs retries on concurrency and availability errors', async () => {
    proxy = await makeServer()

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
    proxy = await makeServer({apiKey: 'api-key', serverUrl: 'http://server.url'})

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
    proxy = await makeServer()
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
    proxy = await makeServer({tunnelUrl: 'http://eg-tunnel'})

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
    proxy = await makeServer({tunnelUrl: 'http://eg-tunnel'})

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
    proxy = await makeServer({tunnelUrl: 'http://eg-tunnel'})

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
})
