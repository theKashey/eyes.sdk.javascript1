const utils = require('@applitools/utils')
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

  it('take webview screenshot', async () => {
    const button = await driver.element({type: 'accessibility id', selector: 'Web view'})
    await button.click()
    await driver.target.getContexts()
    await utils.general.sleep(500)
    const [, webview] = await driver.target.getContexts()
    await driver.target.switchContext(webview)
    await driver.init()

    await test({
      type: 'ios',
      tag: 'webview',
      wait: 1500,
      driver,
      logger,
    })
  })
})
