const {makeDriver, test} = require('../tests')

describe('screenshoter web ios', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios-web', logger})
    await driver.visit('https://applitools.github.io/demo/TestPages/PageWithBurgerMenu/')
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full page screenshot', async () => {
    await test({type: 'web-ios', tag: 'page-fully', fully: true, driver, logger})
  })
})
