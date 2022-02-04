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

  it('take region screenshot', async () => {
    const button = await driver.element({type: 'accessibility id', selector: 'Empty table view'})
    await button.click()
    await driver.init()

    await test({
      type: 'ios',
      tag: 'region',
      region: {x: 30, y: 500, height: 100, width: 200},
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
    })
  })
})
