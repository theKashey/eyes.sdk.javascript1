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

    await test({
      type: 'ios',
      tag: 'element-out-viewport',
      region: {type: 'xpath', selector: '//*[@name="33"]'},
      scrollingMode: 'scroll',
      debug: {path: './logs'},
      driver,
      logger,
    })
  })
})
