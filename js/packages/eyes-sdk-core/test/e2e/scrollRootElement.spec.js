const setupTests = require('./utils/core-e2e-utils')

describe('get root scrollingElement', () => {
  const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach})

  it('test scrollingElement', async () => {
    const sdk = getSDK()
    const driver = getDriver()

    const manager = await sdk.makeManager()
    const eyes = await manager.openEyes({
      driver,
      config: {
        appName: 'scrollingElement',
        testName: 'test scrollingElement',
        saveNewTests: false,
        logs: process.env.APPLITOOLS_SHOW_LOGS ? {type: 'console'} : undefined,
      },
    })
    await driver.get('https://applitools.github.io/demo/TestPages/ScrollingElement/body.html')
    await eyes.check({name: 'body scrolling element'})
    await driver.get('https://applitools.github.io/demo/TestPages/ScrollingElement/html.html')
    await eyes.check({name: 'html scrolling element'})
    await eyes.close({throwErr: true})
  })
})
