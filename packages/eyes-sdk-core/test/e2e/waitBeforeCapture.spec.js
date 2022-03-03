const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('@applitools/spec-driver-selenium')
const {makeSDK} = require('../../index')

describe('waitBeforeCapture', () => {
  let driver, destroyDriver, manager, sdk, eyes

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    sdk = makeSDK({
      name: 'eyes-core',
      version: require('../../package.json').version,
      spec,
      VisualGridClient,
    })
    manager = await sdk.makeManager({type: 'vg', concurrency: 5})
  })

  afterEach(async () => {
    if (destroyDriver) await destroyDriver()
    if (eyes) await eyes.abort()
    await manager.closeManager()
  })

  it('test waitBeforeCapture with layoutBreakpoints - config', async () => {
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
    eyes = await manager.openEyes({driver, config})
    await driver.get('https://applitools.github.io/demo/TestPages/waitBeforeCapture/')
    await eyes.check({})
    await eyes.close({throwErr: true})
  })

  it('test waitBeforeCapture with layoutBreakpoints - checkSettings', async () => {
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
    eyes = await manager.openEyes({driver, config})
    await driver.get('https://applitools.github.io/demo/TestPages/waitBeforeCapture/')
    await eyes.check({settings})
    await eyes.close({throwErr: true})
  })
})
