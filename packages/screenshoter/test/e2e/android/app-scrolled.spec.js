const {makeDriver, test, sleep, logger} = require('../e2e')

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot after manual scroll', async () => {
    const scrollingElement = await driver.mainContext.getScrollingElement()
    await driver.execute('mobile:scrollGesture', {
      elementId: scrollingElement.target['element-6066-11e4-a52e-4f735466cecf'],
      direction: 'down',
      percent: 1,
    })

    await sleep(3000)

    await test({
      type: 'android',
      tag: 'app-scrolled',
      wait: 1500,
      driver,
      logger,
    })
  })
})
