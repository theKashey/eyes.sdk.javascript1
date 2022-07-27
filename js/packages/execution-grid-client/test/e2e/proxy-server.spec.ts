import assert from 'assert'
import {Builder} from 'selenium-webdriver'
import {makeServer} from '../../src'
import {spawn} from 'child_process'

async function createTunnel() {
  process.env.APPLITOOLS_EG_TUNNEL_PORT = 12345
  const tunnel = spawn('node', ['./node_modules/@applitools/eg-tunnel/scripts/run-eg-tunnel.js'], {
    detached: true,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  await new Promise(res => setTimeout(res, 500)) // wait for tunnel to be ready
  tunnel.unref()
  return tunnel
}

describe('proxy-server', () => {
  const eyesServerUrl = 'https://eyesapi.applitools.com'
  let proxy

  afterEach(async () => {
    await proxy.server.close()
  })

  // skipping temporarily due to chrome 103 bug
  it.skip('works with real server', async () => {
    const driver = await new Builder().forBrowser('chrome').usingServer(proxy.url).build()

    await driver.get('https://demo.applitools.com')
    const title = await driver.executeScript('return document.title')

    await driver.quit()

    assert.strictEqual(title, 'ACME demo app')
  })

  // skipping temporarily due to chrome 103 bug
  it.skip('works with real server and tunnels', async () => {
    const tunnel = await createTunnel()
    try {
      proxy = await makeServer({
        egTunnelUrl: 'http://localhost:12345',
        eyesServerUrl,
      })
      const driver = await new Builder()
        .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
        .usingServer(proxy.url)
        .build()

      await driver.get('https://applitools.com')

      await driver.quit()
    } finally {
      tunnel.kill()
    }
  })

  // skipping temporarily due to chrome 103 bug
  it.skip('fails gracefully when tunnel closes during test run', async () => {
    const tunnel = await createTunnel()
    proxy = await makeServer({
      egTunnelUrl: 'http://localhost:12345',
      eyesServerUrl,
    })
    let driver = await new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
      .usingServer(proxy.url)
      .build()
    tunnel.kill()
    await driver.get('https://applitools.com')
    await driver.quit()
    driver = await new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
      .usingServer(proxy.url)
      .build()
    await driver.get('https://applitools.com')
    await driver.quit()
  })
})
