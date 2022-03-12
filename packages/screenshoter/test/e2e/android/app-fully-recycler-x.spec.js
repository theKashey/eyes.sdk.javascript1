const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter androidx app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', app: 'androidx', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot on screen with recycler view', async () => {
    const button = await driver.element({type: 'id', selector: 'btn_recycler_view_activity'})
    await button.click()
    await sleep(3000)

    await driver.init()

    await test({
      type: 'android',
      tag: 'app-fully-recycler-x',
      fully: true,
      framed: true,
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
    })
  })
})
