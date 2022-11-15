const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter androidx app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'android',
      app: 'androidx',
      logger,
      customConfig: {disableHelper: true},
    })
  })

  after(async () => {
    await destroyDriver()
  })

  it('take element screenshot on screen with collapsing header without helper lib', async () => {
    const button = await driver.element({type: 'id', selector: 'btn_recycler_view_nested_collapsing'})
    await button.click()
    await sleep(3000)

    await driver.init()
    await driver.currentContext.setScrollingElement({type: 'id', selector: 'recyclerView'})

    await test({
      type: 'android',
      tag: 'element-no-helper',
      region: {type: 'id', selector: 'card_view'},
      framed: true,
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
    })
  })
})
