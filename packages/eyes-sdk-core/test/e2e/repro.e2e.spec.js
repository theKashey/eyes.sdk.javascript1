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
        testName: 'check e2e test',
        logs: {type: 'console'},
        viewportSize: {width: 1200, height: 800},
      },
    })
    await driver.get('https://www.massmutual.com/insurance/life-insurance/term-life')
    await driver.executeScript("document.querySelector('.mm-navbar--public').style.position = 'absolute'")
    await driver.executeScript(
      "document.querySelector('section.container.card--overlap.mm-spacing>div>div>div.card--basic.card').style.boxShadow = 'unset'",
    )
    //await driver.executeScript("document.querySelector('section.container.card--overlap.mm-spacing>div>div>div.card--basic.card').style.width = 'unset'")
    await eyes.check({
      settings: {
        region: 'section.container.card--overlap.mm-spacing>div>div>div.card--basic.card',
        fully: true,
        //region: 'section.container.card--overlap.mm-spacing>div>div>div.card--basic.card>div>div', fully: true
      },
      config: {
        stitchMode: 'CSS',
      },
    })
    await eyes.close()
  })
})
