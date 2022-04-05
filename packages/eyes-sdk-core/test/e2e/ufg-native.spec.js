const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('@applitools/spec-driver-selenium')
const makeSDK = require('../../lib/new/sdk')

// This is for demo purposes, and was done as part of implementing support for UFG native in core
// The reason it is skipped is because there are generic coverage tests covering the same scenario
describe.skip('UFG native', () => {
  let driver, destroyDriver, sdk, manager

  before(async () => {
    sdk = makeSDK({
      name: 'eyes-core',
      version: require('../../package.json').version,
      spec,
      VisualGridClient,
    })
    manager = await sdk.makeManager({type: 'vg', concurrency: 5})
  })

  after(async () => {
    if (destroyDriver) await destroyDriver()
  })

  describe('Android', () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({
        device: 'Pixel 3 XL',
        app: 'https://applitools.jfrog.io/artifactory/Examples/ufg-native-example.apk',
      })
    })

    it('works', async () => {
      const config = {
        appName: 'core app',
        testName: 'native ufg android',
        waitBeforeCapture: 1500,
        browsersInfo: [{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}}],
        saveNewTests: false,
      }
      const eyes = await manager.openEyes({driver, config})
      await eyes.check()
      await eyes.close({throwErr: true})
    })
  })

  describe('iOS', () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({
        device: 'iPhone 12',
        app: 'https://applitools.jfrog.io/artifactory/Examples/DuckDuckGo-instrumented.app.zip',
      })
    })

    it('works', async () => {
      const config = {
        appName: 'core app',
        testName: 'native ufg ios',
        waitBeforeCapture: 1500,
        browsersInfo: [{iosDeviceInfo: {deviceName: 'iPhone 12', iosVersion: 'latest'}}],
        saveNewTests: false,
      }
      const eyes = await manager.openEyes({driver, config})
      await eyes.check()
      await eyes.close({throwErr: true})
    })
  })
})
