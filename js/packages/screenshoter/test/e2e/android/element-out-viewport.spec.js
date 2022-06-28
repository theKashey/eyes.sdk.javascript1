const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take element out of viewport screenshot', async () => {
    await test({
      type: 'android',
      tag: 'element-out-viewport',
      region: {type: 'id', selector: 'btn_view_pager'},
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
