const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter web', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'chrome', emulation: 'iPhone 6/7/8', headless: false, logger})
    await driver.visit('https://applitools.github.io/demo/TestPages/PageWithBurgerMenu/')
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full page screenshot on emulated ios device', async () => {
    await test({
      type: 'web',
      tag: 'page-fully-ios-emulation',
      fully: true,
      wait: 1500,
      driver,
      logger,
    })
  })
})
