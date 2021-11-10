/* eslint-disable no-undef */
const url = 'http://applitools.github.io/demo/TestPages/FramesTestPage/'
const {strictEqual} = require('assert')

describe('appName1', () => {
  beforeEach(async () => {
    await browser.url(url)
  })

  it('check1', async () => {
    await browser.eyesCheck('region')
    await browser.eyesClearProperties()
    strictEqual('appName1', (await browser.eyesGetConfiguration()).getAppName())
  })
})

describe('appName2', () => {
  beforeEach(async () => {
    await browser.url(url)
  })

  it('check2', async () => {
    await browser.eyesCheck('region')
    strictEqual('appName2', (await browser.eyesGetConfiguration()).getAppName())
  })
})

// this test doesn't pass because in `beforeTest` hook we set the appName, and that runs *after* the `beforeEach` hook and overrides it.
describe.skip('appName3', () => {
  beforeEach(async () => {
    await browser.url(url)
    ;(await browser.eyesGetConfiguration()).setAppName('appName3_')
  })

  it('check3', async () => {
    await browser.eyesCheck('region')
    strictEqual('appName3_', (await browser.eyesGetConfiguration()).getAppName())
  })
})

describe('appName4', () => {
  it('check4', async () => {
    const configuration = await browser.eyesGetConfiguration()
    configuration.setAppName('appName4_1')
    await browser.eyesSetConfiguration(configuration)
    await browser.eyesCheck('region')
    strictEqual('appName4_1', (await browser.eyesGetConfiguration()).getAppName())
  })
})
