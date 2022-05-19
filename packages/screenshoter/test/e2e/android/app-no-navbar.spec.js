const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter android viewport app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'android',
      app: 'https://applitools.jfrog.io/artifactory/Examples/viewportTestApp.apk',
      logger,
    })
  })

  after(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot on screen without navigation bar', async () => {
    const button = await driver.element({type: 'id', selector: 'btnActivityNoNavBar'})
    await button.click()
    await sleep(3000)

    await driver.init()

    await test({
      type: 'android',
      tag: 'app-no-navbar',
      wait: 1500,
      driver,
      logger,
    })
  })
})
