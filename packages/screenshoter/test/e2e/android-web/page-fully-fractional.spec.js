const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter android web', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'android',
      app: 'chrome',
      logger,
      sauceDeviceName: 'Google Pixel 4 GoogleAPI Emulator',
      sauceAndroidVersion: '12.0',
      orientation: 'landscape',
    })
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full page when the result of image size is a fraction', async () => {
    await driver.visit('https://applitools.com/helloworld/')
    await driver.init()

    await test({
      type: 'android-web',
      tag: 'page-fully-fractional',
      fully: true,
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
    })
  })
})
