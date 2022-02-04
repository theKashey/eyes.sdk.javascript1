const {makeDriver, test} = require('../tests')

describe('screenshoter android app', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot (scroll view)', async () => {
    const button = await driver.element({type: 'id', selector: 'btn_scroll_view_footer_header'})
    await button.click()
    await driver.init()

    await test({
      type: 'android',
      tag: 'app-fully-scroll',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
