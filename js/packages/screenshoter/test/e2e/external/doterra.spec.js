const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    // ;[driver, destroyDriver] = await makeDriver({
    //   type: 'android',
    //   app: 'storage:bd0f4b6b-bcb7-46db-978c-2e3f9cdf6989',
    //   logger,
    // })

    ;[driver, destroyDriver] = await makeDriver({
      type: 'android-sauce',
      deviceName: 'Google Pixel 3a XL GoogleAPI Emulator',
      app: 'storage:bd0f4b6b-bcb7-46db-978c-2e3f9cdf6989',
      platformVersion: '11.0',
      logger,
    })

    // ;[driver, destroyDriver] = await makeDriver({
    //   type: 'android-bs',
    //   deviceName: 'Google Pixel 3',
    //   platformVersion: '10.0',
    //   logger,
    // })

    await driver.target.updateSettings({allowInvisibleElements: true})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot', async () => {
    await sleep(20000)
    await driver.element({type: 'id', selector: 'button_load_catalog'}).then(button => button.click())
    await sleep(20000)
    await driver.element({type: 'id', selector: 'login_notification_close_icon'}).then(button => button.click())
    await sleep(10000)
    await driver
      .element({type: '-android uiautomator', selector: 'new UiSelector().textContains("Single Oils")'})
      .then(button => button.click())
    await sleep(10000)

    await driver.init()

    await test({
      type: 'android',
      tag: 'app-fully-doterra',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
