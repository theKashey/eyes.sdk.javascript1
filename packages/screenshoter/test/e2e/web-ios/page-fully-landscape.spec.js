const {makeDriver, test} = require('../tests')

describe('screenshoter web ios', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios-web', orientation: 'landscape', logger})
    await driver.visit('https://applitools.github.io/demo/TestPages/PageWithBurgerMenu/')
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full page screenshot with landscape orientation', async () => {
    await test({type: 'web-ios', tag: 'page-fully-landscape', fully: true, driver, logger})
  })
})
