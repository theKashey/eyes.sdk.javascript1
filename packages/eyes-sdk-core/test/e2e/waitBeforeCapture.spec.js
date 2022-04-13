const setupTests = require('./utils/core-e2e-utils')

describe('waitBeforeCapture', () => {
  const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach})

  let sdk, manager
  beforeEach(async () => {
    sdk = getSDK()
    manager = await sdk.makeManager({type: 'vg', concurrency: 5})
  })

  afterEach(async () => {
    await manager.closeManager()
  })

  it('test waitBeforeCapture with layoutBreakpoints - config', async () => {
    const driver = getDriver()
    const config = {
      appName: 'core app',
      testName: 'waitBeforeCapture with layoutbreakpoints - config',
      layoutBreakpoints: true,
      matchTimeout: 0,
      saveNewTests: false,
      viewportSize: {width: 800, height: 600},
      waitBeforeCapture: 1500,
      browsersInfo: [{name: 'chrome', width: 1000, height: 600}],
    }
    const eyes = await manager.openEyes({driver, config})
    await driver.get('https://applitools.github.io/demo/TestPages/waitBeforeCapture/')
    await eyes.check({})
    await eyes.close({throwErr: true})
  })

  it('test waitBeforeCapture with layoutBreakpoints - checkSettings', async () => {
    const driver = getDriver()
    const config = {
      appName: 'core app',
      testName: 'waitBeforeCapture with layoutbreakpoints - checkSettings',
      layoutBreakpoints: true,
      matchTimeout: 0,
      saveNewTests: false,
      viewportSize: {width: 800, height: 600},
      browsersInfo: [{name: 'chrome', width: 1000, height: 600}],
    }
    const settings = {waitBeforeCapture: 1500}
    const eyes = await manager.openEyes({driver, config})
    await driver.get('https://applitools.github.io/demo/TestPages/waitBeforeCapture/')
    await eyes.check({settings})
    await eyes.close({throwErr: true})
  })
})
