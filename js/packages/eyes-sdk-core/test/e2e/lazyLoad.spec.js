const spec = require('@applitools/spec-driver-selenium')
const {makeSDK} = require('../../index')

describe('lazyLoad', () => {
  let driver, destroyDriver, manager, eyes

  const sdk = makeSDK({
    name: 'eyes-core',
    version: require('../../package.json').version,
    spec,
  })

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  afterEach(async () => {
    if (destroyDriver) await destroyDriver()
    if (eyes) await eyes.abort()
    await manager.closeManager()
  })

  it('test lazyLoad with layoutBreakpoints - checkSettings', async () => {
    manager = await sdk.makeManager({type: 'vg', concurrency: 5})
    const config = {
      appName: 'core app',
      testName: 'lazyLoad with layoutbreakpoints - checkSettings',
      layoutBreakpoints: true,
      matchTimeout: 0,
      saveNewTests: false,
      viewportSize: {width: 800, height: 600},
      browsersInfo: [{name: 'chrome', width: 1000, height: 600}],
    }
    const settings = {
      fully: true,
      lazyLoad: {},
    }
    eyes = await manager.openEyes({driver, config})
    await driver.get('https://applitools.github.io/demo/TestPages/LazyLoad/')
    await eyes.check({settings})
    await eyes.close({throwErr: true})
  })

  it('test lazyLoad with classic - checkSettings', async () => {
    manager = await sdk.makeManager()
    const config = {
      appName: 'core app',
      testName: 'lazyLoad with classic - checkSettings',
      matchTimeout: 0,
      saveNewTests: false,
      viewportSize: {width: 800, height: 600},
    }
    const settings = {
      fully: true,
      lazyLoad: {},
    }
    eyes = await manager.openEyes({driver, config})
    await driver.get('https://applitools.github.io/demo/TestPages/LazyLoad/')
    await eyes.check({settings})
    await eyes.close({throwErr: true})
  })
})
