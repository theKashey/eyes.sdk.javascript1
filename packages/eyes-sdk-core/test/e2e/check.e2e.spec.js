const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('@applitools/spec-driver-selenium')
const {makeSDK} = require('../../index')

// this is an example
describe.skip('check e2e', () => {
  let driver, destroyDriver

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  afterEach(async () => {
    if (destroyDriver) await destroyDriver()
  })

  it('works', async () => {
    const sdk = makeSDK({
      name: 'check e2e',
      version: '1.2.5.',
      spec,
      VisualGridClient,
    })

    const manager = await sdk.makeManager()
    const eyes = await manager.openEyes({
      driver,
      config: {appName: 'check e2e', testName: 'check e2e test', logs: {type: 'console'}},
    })
    await driver.get('https://example.org')
    await eyes.check({config: {cut: {top: 50, bottom: 0, left: 0, right: 0}}})
    await eyes.close({throwErr: true})
  })
})
