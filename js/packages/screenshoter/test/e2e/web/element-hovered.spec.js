const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter web', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'chrome', logger})
    await driver.visit('https://applitools.github.io/demo/TestPages/StickyHeaderWithRegions')
    await driver.setViewportSize({width: 1700, height: 1500})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take hovered element screenshot', async () => {
    const element = await driver.element('#input')
    await driver.target.$(element.target).moveTo()

    await test({
      type: 'web',
      tag: 'element-hovered',
      region: '#input',
      driver,
      logger,
    })
  })
})
