const setupTests = require('./utils/core-e2e-utils')
const {getTestInfo} = require('@applitools/test-utils')
const assert = require('assert')

describe('core e2e', () => {
  const env = {
    device: 'BrowserStack Google Pixel 2',
    app: 'app_android',
  }
  const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach, env})

  it('viewportSize', async () => {
    const sdk = getSDK()
    const driver = getDriver()

    const manager = await sdk.makeManager()

    const eyesCeil = await manager.openEyes({
      driver,
      config: {
        appName: 'core e2e',
        testName: 'viewportSize e2e test',
        useCeilForViewportSize: true,
        matchTimeout: 0,
        saveNewTests: false,
      },
    })
    await eyesCeil.check({fully: false})
    const [testResults] = await eyesCeil.close({throwErr: false})

    const info = await getTestInfo(testResults, process.env.APPLITOOLS_API_KEY)
    assert.deepStrictEqual(info.startInfo.environment.displaySize, {width: 412, height: 660}, 'useCeilForViewportSize')

    const eyesRound = await manager.openEyes({
      driver,
      config: {
        appName: 'core e2e',
        testName: 'viewportSize e2e test',
        matchTimeout: 0,
        saveNewTests: false,
      },
    })
    await eyesRound.check({fully: false})
    const [testResults2] = await eyesRound.close({throwErr: false})

    const info2 = await getTestInfo(testResults2, process.env.APPLITOOLS_API_KEY)
    assert.deepStrictEqual(
      info2.startInfo.environment.displaySize,
      {width: 411, height: 659},
      '!useCeilForViewportSize',
    )
  })
})
