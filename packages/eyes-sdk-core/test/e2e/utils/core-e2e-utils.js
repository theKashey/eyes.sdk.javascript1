const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('@applitools/spec-driver-selenium')
const {makeSDK} = require('../../../index')

function setupTests({before, beforeEach, afterEach, env = {browser: 'chrome'}}) {
  let driver, destroyDriver, sdk

  before(() => {
    sdk = makeSDK({
      name: 'core e2e',
      version: '1.2.3',
      spec,
      VisualGridClient,
    })
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
  }
}

module.exports = setupTests
