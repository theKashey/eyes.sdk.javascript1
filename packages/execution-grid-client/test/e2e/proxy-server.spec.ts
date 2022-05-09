import assert from 'assert'
import {Builder} from 'selenium-webdriver'
import {makeServer} from '../../src'

describe('proxy-server', () => {
  let proxy

  afterEach(async () => {
    await proxy.server.close()
  })

  it('works with real server', async () => {
    proxy = await makeServer({serverUrl: 'https://eyes.applitools.com', apiKey: process.env.APPLITOOLS_API_KEY})
    const driver = await new Builder().forBrowser('chrome').usingServer(proxy.url).build()

    await driver.get('https://demo.applitools.com')
    const title = await driver.executeScript('return document.title')

    await driver.quit()

    assert.strictEqual(title, 'ACME demo app')
  })

  it.skip('works with real server and tunnels', async () => {
    // NOTE:
    // You need to spawn the tunnel server manually
    // The binaries are brought in through the @applitools/eg-demo dev dep
    //
    // Run it with the following command/env vars:
    //
    // APPLITOOLS_EG_TUNNEL_PORT=12345 APPLITOOLS_EG_TUNNEL_MIN_PORT_RANGE=10000 APPLITOOLS_EG_TUNNEL_MAX_PORT_RANGE=20000 APPLITOOLS_EG_TUNNEL_MANAGER_URL=https://exec-wus.applitools.com node_modules/@applitools/eg-demo/eg-tunnel-macos
    //
    // Then you specify the tunnelUrl either in makeServer (with tunnelUrl0 or through the APPLITOOLS_EG_TUNNEL_URL env var

    proxy = await makeServer({
      tunnelUrl: 'http://localhost:12345',
      serverUrl: 'https://eyes.applitools.com',
      apiKey: process.env.APPLITOOLS_API_KEY,
    })

    const driver = await new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
      .usingServer(proxy.url)
      .build()

    await driver.get('https://applitools.com')

    await driver.quit()
  })
})
