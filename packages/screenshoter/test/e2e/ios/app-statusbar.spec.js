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

  it('take viewport screenshot with status bar', async () => {
    const button = await driver.element({type: 'accessibility id', selector: 'Empty table view'})
    await button.click()
    await driver.init()

    await test({
      type: 'ios',
      tag: 'app',
      withStatusBar: true,
      driver,
      logger,
    })
  })
})
