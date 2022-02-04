const {makeDriver, test} = require('../tests')

describe('screenshoter androidx app', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', x: true, logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot (collapsing layout)', async () => {
    const button = await driver.element({type: 'id', selector: 'btn_recycler_view_nested_collapsing'})
    await button.click()
    await driver.init()
    await driver.currentContext.setScrollingElement({type: 'id', selector: 'recyclerView'})

    await test({
      type: 'android',
      tag: 'x-app-fully-collapsing',
      fully: true,
      framed: true,
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
    })
  })
})
