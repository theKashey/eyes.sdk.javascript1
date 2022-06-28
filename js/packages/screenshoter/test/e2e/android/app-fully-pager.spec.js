const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter androidx app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', app: 'androidx', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot on screen with pager view', async () => {
    const scrollingElement = await driver.mainContext.getScrollingElement()
    await driver.execute('mobile:scrollGesture', {
      elementId: scrollingElement.target['element-6066-11e4-a52e-4f735466cecf'],
      direction: 'down',
      percent: 1,
    })

    const button = await driver.element({type: 'id', selector: 'btn_view_pager_2_vertical_activity'})
    await button.click()
    await sleep(3000)

    await driver.init()

    await driver.mainContext.setScrollingElement({type: 'id', selector: 'view_pager'})

    await test({
      type: 'android',
      tag: 'app-fully-pager',
      fully: true,
      framed: true,
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
    })
  })
})
