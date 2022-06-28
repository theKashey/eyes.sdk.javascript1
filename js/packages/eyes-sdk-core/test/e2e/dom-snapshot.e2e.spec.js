const setupTests = require('./utils/core-e2e-utils')

describe('core e2e', () => {
  const {getDriver, getSDK, getBaseUrl} = setupTests({before, after, beforeEach, afterEach})

  it('produces correct snapshot for pages with data url as IMAGE in iframes', async () => {
    const sdk = getSDK()
    const driver = getDriver()
    const baseUrl = getBaseUrl()

    const manager = await sdk.makeManager({type: 'vg', concurrency: 5})
    const eyes = await manager.openEyes({
      driver,
      config: {appName: 'core e2e', testName: 'data url image iframe', saveNewTests: false},
    })
    await driver.get(`${baseUrl}/frames/data-url-image-iframe.html`)
    await eyes.check()
    await eyes.close({throwErr: true})
  })
  it('produces correct snapshot for pages with data url as HTML in iframes', async () => {
    const sdk = getSDK()
    const driver = getDriver()
    const baseUrl = getBaseUrl()

    const manager = await sdk.makeManager({type: 'vg', concurrency: 5})
    const eyes = await manager.openEyes({
      driver,
      config: {appName: 'core e2e', testName: 'data url html iframe', saveNewTests: false},
    })
    await driver.get(`${baseUrl}/frames/data-url-html-iframe.html`)
    await eyes.check()
    await eyes.close({throwErr: true})
  })
})
