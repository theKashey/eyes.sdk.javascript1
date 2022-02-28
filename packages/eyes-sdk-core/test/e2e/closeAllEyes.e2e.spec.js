const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('@applitools/spec-driver-selenium')
const {makeSDK} = require('../../index')
const assert = require('assert')

describe('Core e2e - closeAllEyes', () => {
  let driver, destroyDriver
  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  afterEach(async () => {
    if (destroyDriver) await destroyDriver()
  })

  it('aborts unclosed tests with test results', async () => {
    const sdk = makeSDK({
      name: 'some sdk',
      version: '1.2.5.',
      spec,
      VisualGridClient,
    })
    const manager = await sdk.makeManager()
    const eyes = await manager.openEyes({
      driver,
      config: {
        appName: 'core e2e',
        testName: 'aborts unclosed tests',
        matchTimeout: 0,
        logs: process.env.APPLITOOLS_SHOW_LOGS ? {type: 'console'} : undefined
      },
    })
    await eyes.check()
    const results = await manager.closeAllEyes()
    assert.ok(results && results.length === 1 && results[0].constructor.name === 'TestResults' && results[0].getIsAborted())
  })
})
