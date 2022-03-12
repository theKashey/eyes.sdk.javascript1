const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter ios web', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios', app: 'safari', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot on page with no scale', async () => {
    await driver.visit('http://applitoolsdemo.eastus.cloudapp.azure.com/test-noscale.html')
    await sleep(5000)

    await driver.init()

    await test({
      type: 'ios-web',
      tag: 'page-noscale',
      driver,
      logger,
    })
  })
})
