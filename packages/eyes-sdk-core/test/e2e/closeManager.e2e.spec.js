const setupTests = require('./utils/core-e2e-utils')
const assert = require('assert')

describe('Core e2e - closeManager', () => {
  const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach})

  it('aborts unclosed tests with test results', async () => {
    const sdk = getSDK()
    const driver = getDriver()

    const manager = await sdk.makeManager()
    const eyes = await manager.openEyes({
      driver,
      config: {
        appName: 'core e2e',
        testName: 'aborts unclosed tests',
        matchTimeout: 0,
        logs: process.env.APPLITOOLS_SHOW_LOGS ? {type: 'console'} : undefined,
      },
    })

    await eyes.check({fully: false})
    const summary = await manager.closeManager()
    assert.ok(summary.results)
    assert.ok(summary.results.length === 1)
    assert.ok(summary.results[0].testResults.isAborted)
  })
})
