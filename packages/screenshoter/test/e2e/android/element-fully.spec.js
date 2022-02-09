const {makeDriver, sleep, test} = require('../e2e')

describe('screenshoter androidx app', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', app: 'androidx', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full element screenshot', async () => {
    const button = await driver.element({type: 'id', selector: 'btn_recycler_view_in_scroll_view_activity'})
    await button.click()
    await sleep(3000)

    await driver.init()

    return test({
      type: 'android',
      tag: 'element-fully',
      region: {type: 'id', selector: 'recyclerView'},
      fully: true,
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
    })
  })
})
