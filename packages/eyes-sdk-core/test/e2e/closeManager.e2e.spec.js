const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('@applitools/spec-driver-selenium')
const {makeSDK} = require('../../index')
const assert = require('assert')

describe('Core e2e - closeManager', () => {
  let driver, destroyDriver, sdk
  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  afterEach(async () => {
    if (destroyDriver) await destroyDriver()
  })

  before(() => {
    sdk = makeSDK({
      name: 'some sdk',
      version: '1.2.5.',
      spec,
      VisualGridClient,
    })
  })

  it('aborts unclosed tests with test results', async () => {
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
