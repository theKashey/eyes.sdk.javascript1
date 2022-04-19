const spec = require('../../dist/spec-driver')
const setupEyes = require('@applitools/test-utils/src/setup-eyes')
const {Eyes, VisualGridRunner} = require('../../dist')

// ported from eyes-sdk-core/e2e/ufg-native.spec.js
describe('UFG native', () => {
  describe('Android', () => {
    it('works', async () => {
      try {
        process.env.APPLITOOLS_TEST_REMOTE = 'sauce'
        let driver, destroyDriver
        ;[driver, destroyDriver] = await spec.build({
          device: 'Pixel 3 XL duckduckgo',
          app: 'https://applitools.jfrog.io/artifactory/Examples/duckduckgo-5.87.0-play-debug.apk',
        })
        const config = {
          apiKey: process.env.APPLITOOLS_API_KEY_SDK,
          appName: 'core app',
          testName: 'native ufg android',
          waitBeforeCapture: 1500,
          dontCloseBatches: true,
          browsersInfo: [
            {androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}},
            //{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}},
            //{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}},
            //{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}},
            //{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}},
            //{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}},
            //{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}},
            //{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}},
            //{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}},
            //{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}},
          ],
          saveNewTests: false,
        }
        const eyes = new Eyes(new VisualGridRunner({testConcurrency: 5}))
        eyes.setConfiguration(config)

        await eyes.open(driver)
        await eyes.check()
        await eyes.check()
        await eyes.close({throwErr: true})
      } finally {
        try {
          await destroyDriver()
        } catch (error) {
          console.log(error)
          // no-op
        }
      }
    })
  })

  //describe('iOS', () => {
  //  const env = {
  //    device: 'iPhone 12 UFG native',
  //    app: 'https://applitools.jfrog.io/artifactory/Examples/DuckDuckGo-instrumented.app.zip',
  //  }
  //  const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach, env})

  //  it('works', async () => {
  //    const sdk = getSDK()
  //    const driver = getDriver()
  //    const config = {
  //      appName: 'core app',
  //      testName: 'native ufg ios',
  //      waitBeforeCapture: 1500,
  //      browsersInfo: [{iosDeviceInfo: {deviceName: 'iPhone 12', iosVersion: 'latest'}}],
  //      saveNewTests: false,
  //    }
  //    const manager = await sdk.makeManager({type: 'vg', concurrency: 5})
  //    const eyes = await manager.openEyes({driver, config})
  //    await eyes.check()
  //    await eyes.check()
  //    await eyes.close({throwErr: true})
  //  })
  //})
})
