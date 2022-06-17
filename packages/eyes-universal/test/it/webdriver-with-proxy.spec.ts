import * as spec from '../../src/spec-driver/webdriver'
import {startProxyServer} from '../utils/proxy-server'
import assert from 'assert'

describe('webdriver with proxy', () => {
  let driver: spec.Driver, destroyDriver, proxy, serverUrl, pageUrl

  before(async () => {
    proxy = await startProxyServer()
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome-win'})
    serverUrl = `${driver.options.protocol}://${driver.options.hostname}:${driver.options.port}/${driver.options.path}`
    pageUrl = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'
    await driver.navigateTo(pageUrl)
  })

  after(async () => {
    if (destroyDriver) await destroyDriver()
    if (proxy) await proxy.close()
  })

  it('works', async () => {
    const proxifiedDriver = spec.transformDriver({
      sessionId: driver.sessionId,
      serverUrl,
      proxy: {url: `http://localhost:${proxy.port}`, tunnel: false},
      capabilities: driver.capabilities,
    })
    assert.strictEqual(await proxifiedDriver.getUrl(), pageUrl)
  })

  it('works with tunnel', async () => {
    const proxifiedDriver = spec.transformDriver({
      sessionId: driver.sessionId,
      serverUrl,
      proxy: {url: `http://localhost:${proxy.port}`, tunnel: true},
      capabilities: driver.capabilities,
    })
    assert.strictEqual(await proxifiedDriver.getUrl(), pageUrl)
  })
})
