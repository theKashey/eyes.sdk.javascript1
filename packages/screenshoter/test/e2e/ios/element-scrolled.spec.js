const {makeDriver, test, sleep, logger} = require('../e2e')

describe('screenshoter ios app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take element out of viewport screenshot', async () => {
    const button = await driver.element({type: 'accessibility id', selector: 'Scroll view'})
    await button.click()
    await sleep(3000)

    await driver.init()

    const scrollingElement = await driver.mainContext.getScrollingElement()
    await driver.execute('mobile:swipe', {
      elementId: scrollingElement.target['element-6066-11e4-a52e-4f735466cecf'],
      direction: 'up',
      velocity: 10,
    })
    await sleep(3000)

    await test({
      type: 'ios',
      tag: 'element-scrolled',
      region: {type: 'xpath', selector: '//*[@name="24"]'},
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
