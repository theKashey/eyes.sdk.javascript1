const assert = require('assert')
const pixelmatch = require('pixelmatch')
const {Driver} = require('@applitools/driver')
const spec = require('@applitools/spec-driver-webdriverio')
const takeScreenshot = require('../../index')
const makeImage = require('../../src/image')

const env = {
  url: 'https://ondemand.saucelabs.com/wd/hub',
  capabilities: {
    name: 'iOS Web Screenshoter Test',
    deviceName: 'iPhone 11 Pro Simulator',
    browserName: 'safari',
    platformName: 'iOS',
    platformVersion: '14.5',
    appiumVersion: '1.20.1',
    automationName: 'XCUITest',
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
  },
}

describe('screenshoter web ios', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, browser, destroyBrowser

  before(async () => {
    ;[browser, destroyBrowser] = await spec.build(env)
  })

  after(async () => {
    await destroyBrowser()
  })

  beforeEach(async () => {
    driver = await new Driver({driver: browser, spec, logger}).init()
    await driver.visit('https://applitools.github.io/demo/TestPages/PageWithBurgerMenu/')
    await driver.setViewportSize({width: 700, height: 460})
  })

  it('take viewport screenshot', () => {
    return viewport()
  })

  it('take full page screenshot', () => {
    return fullPage()
  })

  async function viewport(options) {
    const screenshot = await takeScreenshot({logger, driver, ...options})
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web-ios/page.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'ios_viewport_failed'})
      throw err
    }
  }

  async function fullPage(options) {
    const screenshot = await takeScreenshot({logger, driver, fully: true, ...options})
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web-ios/page-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'ios_full_page_failed'})
      throw err
    }
  }
})
