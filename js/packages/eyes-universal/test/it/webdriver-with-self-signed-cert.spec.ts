import assert from 'assert'
import {makeTestServer, makeProxyServer, restrictNetwork} from '@applitools/test-server'
import * as utils from '@applitools/utils'
import * as spec from '../../src/spec-driver/webdriver'

describe('webdriver with self-signed cert', () => {
  let driver: spec.Driver, destroyDriver, proxyServer, webdriverServer, restoreNetwork, pageUrl

  before(async () => {
    webdriverServer = await makeTestServer({
      middlewares: ['webdriver'],
      key: './test/fixtures/key.pem',
      cert: './test/fixtures/cert.pem',
    })
    proxyServer = await makeProxyServer()
    ;[driver, destroyDriver] = await spec.build({
      url: `https://localhost:${webdriverServer.port}`,
      capabilities: {browserName: 'test'},
    })
    pageUrl = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'
    await driver.navigateTo(pageUrl)
    restoreNetwork = restrictNetwork(options => {
      if (
        utils.types.has(options, 'port') &&
        options.port === webdriverServer.port &&
        (!options.host || options.host === 'localhost') &&
        (options as any).headers?.['x-proxy-agent'] !== 'TestProxy'
      ) {
        return false
      }
      return true
    })
  })

  after(async () => {
    if (restoreNetwork) await restoreNetwork()
    if (destroyDriver) await destroyDriver()
    if (proxyServer) await proxyServer.close()
    if (webdriverServer) await webdriverServer.close()
  })

  it('with proxy', async () => {
    const proxifiedDriver = spec.transformDriver({
      sessionId: driver.sessionId,
      serverUrl: `https://localhost:${webdriverServer.port}`,
      proxyUrl: `http://localhost:${proxyServer.port}`,
      capabilities: driver.capabilities,
    })
    assert.strictEqual(await proxifiedDriver.getUrl(), pageUrl)
  })
})
