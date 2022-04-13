const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('@applitools/spec-driver-selenium')
const {testServerInProcess} = require('@applitools/test-server')
const {makeSDK} = require('../../../index')

function setupTests({before, after, beforeEach, afterEach, env = {browser: 'chrome'}}) {
  let driver, destroyDriver, sdk, testServer

  before(async () => {
    sdk = makeSDK({
      name: 'core e2e',
      version: '1.2.3',
      spec,
      VisualGridClient,
    })

    testServer = await testServerInProcess()
  })

  after(async () => {
    await testServer.close()
  })

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build(env)
  })

  afterEach(async () => {
    if (destroyDriver) await destroyDriver()
  })

  return {
    getDriver: () => driver,
    getSDK: () => sdk,
    getBaseUrl: () => `http://localhost:${testServer.port}`,
  }
}

module.exports = setupTests
