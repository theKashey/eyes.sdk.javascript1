const setupTests = require('./utils/core-e2e-utils')

// sample test used to track down universal sdk issues reported by non-JS languages
describe.skip('repro', () => {
  const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach})

  it('works', async () => {
    const sdk = getSDK()
    const driver = getDriver()

    const manager = await sdk.makeManager()
    const eyes = await manager.openEyes({
      driver,
      config: {
        appName: 'check e2e',
        testName: 'repro 1277',
        logs: {type: 'console'},
        viewportSize: {width: 1200, height: 800},
      },
    })
    await driver.get('https://applitools.github.io/demo/TestPages/CodedRegionPage/index.html')
    await driver.findElement({css: '#secondary'}).click()

    await eyes.check({
      settings: {
        fully: true,
        ignoreRegions: ['#secondary'],
      },
      config: {
        stitchMode: 'CSS',
      },
    })

    await eyes.close()
  })
})
