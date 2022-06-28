const setupTests = require('./utils/core-e2e-utils')

// This is for demo purposes, and was done as part of implementing support for UFG native in core
// The reason it is skipped is because there are generic coverage tests covering the same scenario
describe.skip('UFG native', () => {
  describe('Android', () => {
    const env = {
      device: 'Pixel 3 XL duckduckgo',
      app: 'https://applitools.jfrog.io/artifactory/Examples/duckduckgo-5.87.0-play-debug.apk',
    }
    const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach, env})

    it('works', async () => {
      const sdk = getSDK()
      const driver = getDriver()

      const manager = await sdk.makeManager({type: 'vg', concurrency: 5})

      const config = {
        appName: 'core app',
        testName: 'native ufg android',
        waitBeforeCapture: 1500,
        browsersInfo: [{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}}],
        saveNewTests: false,
      }
      const eyes = await manager.openEyes({driver, config})
      await eyes.check()
      await eyes.check()
      await eyes.close({throwErr: true})
    })
  })

  describe('iOS', () => {
    const env = {
      device: 'iPhone 12 UFG native',
      app: 'https://applitools.jfrog.io/artifactory/Examples/DuckDuckGo-instrumented.app.zip',
    }
    const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach, env})

    it('works', async () => {
      const sdk = getSDK()
      const driver = getDriver()
      const config = {
        appName: 'core app',
        testName: 'native ufg ios',
        waitBeforeCapture: 1500,
        browsersInfo: [{iosDeviceInfo: {deviceName: 'iPhone 12', iosVersion: 'latest'}}],
        saveNewTests: false,
      }
      const manager = await sdk.makeManager({type: 'vg', concurrency: 5})
      const eyes = await manager.openEyes({driver, config})
      await eyes.check()
      await eyes.check()
      await eyes.close({throwErr: true})
    })
  })
})
