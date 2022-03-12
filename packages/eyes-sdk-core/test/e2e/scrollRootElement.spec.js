const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('@applitools/spec-driver-selenium')
const {makeSDK} = require('../../index')

describe('get root scrollingElement', () => {
  let driver, destroyDriver, sdk, manager, eyes, config
  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    sdk = makeSDK({
      name: 'scrollingElement',
      version: '1.2.5.',
      spec,
      VisualGridClient,
    })
    manager = await sdk.makeManager()
    config = {
      appName: 'scrollingElement',
      testName: 'test scrollingElement',
      saveNewTests: false,
      logs: process.env.APPLITOOLS_SHOW_LOGS ? {type: 'console'} : undefined,
    }
  })

  afterEach(async () => {
    if (destroyDriver) await destroyDriver()
    if (eyes) await eyes.abort()
    await manager.closeManager()
  })

  it('test scrollingElement', async () => {
    eyes = await manager.openEyes({
      driver,
      config,
    })
    await driver.get('https://applitools.github.io/demo/TestPages/ScrollingElement/body.html')
    await eyes.check({name: 'body scrolling element'})
    await driver.get('https://applitools.github.io/demo/TestPages/ScrollingElement/html.html')
    await eyes.check({name: 'html scrolling element'})
    await eyes.close({throwErr: true})
  })
})
