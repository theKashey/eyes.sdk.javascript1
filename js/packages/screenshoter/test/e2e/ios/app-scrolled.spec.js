const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter ios app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot after manual scroll', async () => {
    const button = await driver.element({type: 'accessibility id', selector: 'Scroll view'})
    await button.click()
    await sleep(3000)

    await driver.init()

    const scrollingElement = await driver.mainContext.getScrollingElement()
    await driver.execute('mobile:scroll', {
      elementId: scrollingElement.target['element-6066-11e4-a52e-4f735466cecf'],
      direction: 'down',
    })
    await sleep(3000)

    await test({
      type: 'ios',
      tag: 'app-scrolled',
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
    })
  })
})
