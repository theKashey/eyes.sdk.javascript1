const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter android app', () => {
  let driver, destroyDriver

  beforeEach(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', logger})
  })

  afterEach(async () => {
    await destroyDriver()
  })

  it('take full webview screenshot', async () => {
    const button = await driver.element({type: 'id', selector: 'com.applitools.eyes.android:id/btn_web_view'})
    await button.click()

    await test({
      type: 'android',
      tag: 'webview-fully',
      fully: true,
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
      webview: true,
    })
  })
})
