const {makeDriver, test, sleep, logger} = require('../e2e')

describe('screenshoter ios app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios', logger, orientation: 'landscape'})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot on device with default landscape orientation', async () => {
    await test({
      type: 'ios',
      tag: 'app-landscape-default',
      wait: 1500,
      driver,
      logger,
    })
  })
})

describe('screenshoter ios app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot on device with landscape orientation', async () => {
    await driver.setOrientation('landscape')

    await sleep(5000)

    await driver.init()

    await test({
      type: 'ios',
      tag: 'app-landscape',
      wait: 1500,
      driver,
      logger,
    })
  })
})
