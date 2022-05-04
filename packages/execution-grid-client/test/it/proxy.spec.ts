import nock from 'nock'
import {Builder} from 'selenium-webdriver'
import {makeServer} from '../../src/proxy-server'

describe('proxy', () => {
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

    await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
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
})
