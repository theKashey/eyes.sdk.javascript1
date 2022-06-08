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

    await driver.target.touchAction([
      {action: 'press', y: 500, x: 50},
      {action: 'wait', ms: 100},
      {action: 'moveTo', y: 100, x: 50},
      {action: 'wait', ms: 100},
      {action: 'moveTo', y: 100, x: 51},
      {action: 'release'},
    ])
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
