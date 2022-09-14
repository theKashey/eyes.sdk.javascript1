const setupTests = require('./utils/core-e2e-utils')
const {testProxyServer} = require('@applitools/test-server')

describe('UFG native NML', () => {
  describe.skip('Android', () => {
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
        testName: 'native ufg android nml',
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
    const env = {
      device: 'iPhone 12',
      app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp-instrumented-nml-nmg-flat-caps.zip',
      injectUFGLib: true,
      withNML: true,
    }
    const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach, env})

    it('works', async () => {
      const sdk = getSDK()
      const driver = getDriver()
      const config = {
        appName: 'core app',
        testName: 'native ufg ios nml',
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

    it('works with proxy', async () => {
      let proxyServer
      try {
        proxyServer = await testProxyServer()
        const sdk = getSDK()
        const driver = getDriver()
        const config = {
          appName: 'core app',
          testName: 'native ufg ios nml',
          waitBeforeCapture: 1500,
          browsersInfo: [{iosDeviceInfo: {deviceName: 'iPhone 12', iosVersion: 'latest'}}],
          saveNewTests: false,
          proxy: {
            url: `http://localhost:${proxyServer.port}`,
          },
        }
        const manager = await sdk.makeManager({type: 'vg', concurrency: 5})
        const eyes = await manager.openEyes({driver, config})
        await eyes.check()
        await eyes.check()
        await eyes.close({throwErr: true})
      } finally {
        if (proxyServer) await proxyServer.close()
      }
    })
  })
})
