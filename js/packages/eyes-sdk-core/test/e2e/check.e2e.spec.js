const setupTests = require('./utils/core-e2e-utils')

// this is an example
describe.skip('check e2e', () => {
  const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach})

  it('works', async () => {
    const sdk = getSDK()
    const driver = getDriver()

    const manager = await sdk.makeManager()
    const eyes = await manager.openEyes({
      driver,
      config: {appName: 'core e2e', testName: 'check e2e test'},
    })
    await driver.get('https://example.org')
    await eyes.check({config: {cut: {top: 50, bottom: 0, left: 0, right: 0}}})
    await eyes.close({throwErr: true})
  })
})
