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

  it('take viewport screenshot', async () => {
    await driver.target.setOrientation('PORTRAIT')
    await driver.target.refresh()
    await driver.init()

    await test({type: 'web-ios', tag: 'page', driver, logger})
  })
})
