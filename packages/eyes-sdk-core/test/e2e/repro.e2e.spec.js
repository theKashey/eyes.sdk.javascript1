const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('@applitools/spec-driver-selenium')
const {makeSDK} = require('../../index')

// sample test used to track down universal sdk issues reported by non-JS languages
describe.skip('repro', () => {
  let driver, destroyDriver
  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome', headless: false})
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
