const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot on screen with no scrollable view', async () => {
    const button = await driver.element({type: 'id', selector: 'btn_activity_as_dialog'})
    await button.click()
    await sleep(3000)

    await driver.init()

    await test({
      type: 'android',
      tag: 'app-fully-not-scrollable',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
