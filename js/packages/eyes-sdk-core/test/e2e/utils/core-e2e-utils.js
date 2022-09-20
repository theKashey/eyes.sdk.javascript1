const selenium = require('selenium-webdriver')
const spec = require('@applitools/spec-driver-selenium')
const {testServerInProcess} = require('@applitools/test-server')
const {makeSDK} = require('../../../index')

function adjustUrlToDocker(url, {platform = process.platform} = {}) {
  if (platform === 'darwin') return url.replace(/:\/\/localhost/, '://host.docker.internal')
  return url
}

function setupTests({before, after, beforeEach, afterEach, env = {browser: 'chrome'}}) {
  let driver, destroyDriver, sdk, testServer

  before(async () => {
    sdk = makeSDK({
      name: 'core e2e',
      version: '1.2.3',
      spec,
    })

    testServer = await testServerInProcess()
  })

  after(async () => {
    await testServer.close()
  })

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({selenium, ...env})
  })

  afterEach(async () => {
    if (destroyDriver) await destroyDriver()
  })

  return {
    getDriver: () => driver,
    getSDK: () => sdk,
    getBaseUrl: () => adjustUrlToDocker(`http://localhost:${testServer.port}`),
  }
}

module.exports = setupTests
