// re: https://trello.com/c/PrGEKzhJ
const cwd = process.cwd()
const path = require('path')
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {setupEyes} = require('@applitools/test-utils')
const {Target} = require(cwd)

describe.skip('Check Region, Chrome on Android', async () => {
  let eyes
  let driver
  before(async () => {
    driver = await spec.build({browser: 'chrome', device: 'Pixel 3 XL', remote: 'sauce'})
    eyes = setupEyes()
  })

  after(async () => {
    await eyes.abortIfNotClosed()
    await spec.cleanup(driver)
  })

  // TODO: replace with an example AUT we control
  it('captures element that fills the viewport which needs to be scrolled into view', async function() {
    await spec.visit(driver, 'https://www.asos.com/search/?q=jeans')
    await eyes.open(driver, this.test.parent.title, 'Check Region, Chrome on Android')
    await spec.waitUntilDisplayed(driver, '#plp', 5000)
    await spec.click(driver, '#chrome-welcome-mat > div > div > button')
    await eyes.check(
      'element that fills the viewport which needs to be scrolled into view',
      Target.region('#plp'),
    )
    await eyes.close(true)
  })
})
