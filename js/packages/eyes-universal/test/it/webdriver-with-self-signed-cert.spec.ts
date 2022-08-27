import assert from 'assert'
import {testServer, testProxyServer} from '@applitools/test-server'
import * as spec from '../../src/spec-driver/webdriver'

describe('webdriver with self-signed cert', () => {
  let driver: spec.Driver, destroyDriver, proxyServer, webdriverServer, serverUrl, pageUrl

  before(async () => {
    proxyServer = await testProxyServer()
    webdriverServer = await testServer({
      middlewares: ['webdriver'],
      key: './test/fixtures/key.pem',
      cert: './test/fixtures/cert.pem',
    })
    ;[driver, destroyDriver] = await spec.build({
      url: `https://localhost:${webdriverServer.port}`,
      capabilities: {browserName: 'test'},
    })
    serverUrl = `${driver.options.protocol}://${driver.options.hostname}:${driver.options.port}/${driver.options.path}`
    pageUrl = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'
    await driver.navigateTo(pageUrl)
  })

  after(async () => {
    if (destroyDriver) await destroyDriver()
    if (proxyServer) await proxyServer.close()
    if (webdriverServer) await webdriverServer.close()
  })

  it('with proxy', async () => {
    const proxifiedDriver = spec.transformDriver({
      sessionId: driver.sessionId,
      serverUrl,
      proxyUrl: `http://localhost:${proxyServer.port}`,
      capabilities: driver.capabilities,
    })
    assert.strictEqual(await proxifiedDriver.getUrl(), pageUrl)
  })

  it('without proxy', async () => {
    const transformedDriver = spec.transformDriver({
      sessionId: driver.sessionId,
      serverUrl,
      capabilities: driver.capabilities,
    })
    assert.strictEqual(await transformedDriver.getUrl(), pageUrl)
  })
})
