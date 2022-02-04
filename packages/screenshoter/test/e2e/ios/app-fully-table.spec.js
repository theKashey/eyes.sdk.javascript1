const {makeDriver, test} = require('../tests')

describe('screenshoter ios app', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot (table view)', async () => {
    const button = await driver.element({type: 'accessibility id', selector: 'Table view'})
    await button.click()
    await driver.init()

    await test({
      type: 'ios',
      tag: 'app-fully-table',
      fully: true,
      framed: true,
      scrollingMode: 'scroll',
      wait: 1500,
      overlap: {top: 10, bottom: 50},
      driver,
      logger,
    })
  })
})
