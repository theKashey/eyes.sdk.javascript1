const setupTests = require('./utils/core-e2e-utils')

describe('waitBeforeCapture with viewport size less than 500px', () => {
  const {getDriver, getSDK} = setupTests({
    before,
    after,
    beforeEach,
    afterEach,
    env: {browser: 'chrome', headless: false},
  })

  let sdk, manager
  beforeEach(async () => {
    sdk = getSDK()
    manager = await sdk.makeManager({type: 'vg', concurrency: 5})
  })

  afterEach(async () => {
    await manager.closeManager()
  })

  it('test waitBeforeCapture with viewport size less than 500px', async () => {
    const driver = getDriver()
    const config = {
      appName: 'core app',
      testName: 'should show smurfs with small viewport size',
      layoutBreakpoints: true,
      matchTimeout: 0,
      saveNewTests: false,
      viewportSize: {width: 800, height: 600},
      browsersInfo: [{name: 'chrome', width: 390, height: 400}],
    }
    const settings = {waitBeforeCapture: 1500}
    const eyes = await manager.openEyes({driver, config})
    await driver.get('https://applitools.github.io/demo/TestPages/waitBeforeCapture/smallViewportSize')
    await eyes.check({settings})
    await eyes.close({throwErr: true})
  })
})
