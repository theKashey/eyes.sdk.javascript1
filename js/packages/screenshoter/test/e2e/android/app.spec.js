const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot', async () => {
    await test({
      type: 'android',
      tag: 'app',
      wait: 1500,
      driver,
      logger,
    })
  })
})
