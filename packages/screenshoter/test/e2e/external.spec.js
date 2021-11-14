const assert = require('assert')
const pixelmatch = require('pixelmatch')
const {Driver} = require('@applitools/driver')
const utils = require('@applitools/utils')
const spec = require('@applitools/spec-driver-webdriverio')
const makeImage = require('../../src/image')
const screenshoter = require('../../index')

describe.skip('external tests', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let browser, destroyBrowser

  afterEach(async () => {
    await destroyBrowser()
  })

  it('AGL - full app screenshot of the view with animated scroll', async () => {
    const expectedPath = `./test/fixtures/external/agl.png`

    ;[browser, destroyBrowser] = await spec.build({
      url: 'https://hub.browserstack.com/wd/hub',
      capabilities: {
        platformName: 'android',
        'appium:platformVersion': '11.0',
        'appium:deviceName': 'Google Pixel 5',
        'appium:app': 'android_agl_app',
        'bstack:options': {
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        },
      },
    })

    await browser.closeApp()
    await browser.launchApp()
    const driver = await new Driver({driver: browser, spec, logger}).init()

    const saveBtn = await browser.$('//android.widget.Button')
    await saveBtn.click()

    await utils.general.sleep(8000)
    const signinBtn = await browser.$('//android.widget.Button[@text="SIGN IN"]')
    await signinBtn.click()
    await utils.general.sleep(8000)
    const emailInput = await browser.$('//android.widget.EditText')
    await emailInput.setValue('daniel.martin@toro.com')
    const nxtBtn = await browser.$('//android.widget.Button[@text="NEXT"]')
    await nxtBtn.click()
    await utils.general.sleep(8000)
    const passwordInput = await browser.$('//android.widget.EditText[@password="true"]')
    await passwordInput.setValue('Welcome@1')
    const loginBtn = await browser.$('//android.widget.Button[@text="LOGIN"]')
    await loginBtn.click()
    await utils.general.sleep(18000)

    const skipBtn = await browser.$('//android.widget.Button[@text="SKIP"]')
    await skipBtn.click()
    await utils.general.sleep(5000)
    const finishBtn = await browser.$('//android.widget.Button[@text="FINISH"]')
    await finishBtn.click()
    await utils.general.sleep(15000)

    // const billingBtn = await browser.$('//android.widget.FrameLayout[@content-desc="Billing"]')
    // await billingBtn.click()
    // await utils.general.sleep(25000)

    const screenshot = await screenshoter({
      logger,
      driver,
      fully: true,
      framed: true,
      stabilization: {crop: {top: 53, bottom: 16, left: 0, right: 0}},
      debug: {path: './'},
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage(expectedPath).toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'viewport_failed', suffix: Date.now()})
      throw err
    }
  })
})
