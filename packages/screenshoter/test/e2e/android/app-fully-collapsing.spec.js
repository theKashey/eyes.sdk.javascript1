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

  it('take full app screenshot on screen with collapsing header', async () => {
    const button = await driver.element({type: 'id', selector: 'btn_recycler_view_nested_collapsing'})
    await button.click()
    await sleep(3000)

    await driver.init()
    await driver.currentContext.setScrollingElement({type: 'id', selector: 'recyclerView'})

    await test({
      type: 'android',
      tag: 'app-fully-collapsing',
      fully: true,
      framed: true,
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
    })
  })
})
