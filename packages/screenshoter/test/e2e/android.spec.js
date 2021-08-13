const assert = require('assert')
const pixelmatch = require('pixelmatch')
const {Driver} = require('@applitools/driver')
const spec = require('../util/spec-driver')
const makeImage = require('../../src/image')
const screenshoter = require('../../index')

describe('screenshoter', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, browser, destroyBrowser

  async function sanitizeStatusBar(image) {
    const patchImage = makeImage({
      width: 85,
      height: 18,
      data: Buffer.alloc(85 * 18 * 4, Buffer.from([0, 0xed, 0xed, 0xff])),
    })
    await image.copy(patchImage, {x: 270, y: 4})
  }

  describe('android app', () => {
    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({type: 'android'})
    })

    after(async () => {
      await destroyBrowser()
    })

    beforeEach(async () => {
      await browser.closeApp()
      await browser.launchApp()
      driver = await new Driver({driver: browser, spec, logger}).init()
    })

    it('take viewport screenshot', () => {
      return app()
    })

    it('take viewport screenshot with status bar', () => {
      return app({withStatusBar: true})
    })

    it('take full app screenshot (scroll view)', () => {
      return fullApp({type: 'scroll'})
    })

    it('take full app screenshot with status bar (scroll view)', () => {
      return fullApp({type: 'scroll', withStatusBar: true})
    })

    it('take full app screenshot (recycler view)', () => {
      return fullApp({type: 'recycler'})
    })

    it('take region screenshot', () => {
      region()
    })

    it.skip('take full region screenshot', () => {
      return fullRegion()
    })

    it('take element screenshot', () => {
      return element()
    })
  })

  describe('androidx app', () => {
    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({type: 'androidx'})
    })

    after(async () => {
      await destroyBrowser()
    })

    beforeEach(async () => {
      await browser.closeApp()
      await browser.launchApp()
      driver = await new Driver({driver: browser, spec, logger}).init()
    })

    it('take full app screenshot (recycler view)', () => {
      return fullApp({type: 'recycler', x: true})
    })

    it('take full element screenshot', () => {
      return fullElement()
    })
  })

  async function app(options = {}) {
    const expectedPath = `./test/fixtures/android/app${options.withStatusBar ? '-statusbar' : ''}.png`

    const screenshot = await screenshoter({logger, driver, wait: 1500, ...options})
    try {
      if (options.withStatusBar) await sanitizeStatusBar(screenshot.image)
      const actual = await screenshot.image.toObject()
      const expected = await makeImage(expectedPath).toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'viewport_failed', suffix: Date.now()})
      throw err
    }
  }
  async function fullApp({type, x, ...options} = {}) {
    let buttonSelector, expectedPath
    if (type === 'recycler') {
      if (x) {
        buttonSelector = {type: 'id', selector: 'btn_recycler_view_activity'}
        expectedPath = `./test/fixtures/android/x-app-fully-recycler${options.withStatusBar ? '-statusbar' : ''}.png`
      } else {
        buttonSelector = {type: 'id', selector: 'btn_recycler_view'}
        expectedPath = `./test/fixtures/android/app-fully-recycler${options.withStatusBar ? '-statusbar' : ''}.png`
      }
    } else {
      buttonSelector = {type: 'id', selector: 'btn_scroll_view_footer_header'}
      expectedPath = `./test/fixtures/android/app-fully-scroll${options.withStatusBar ? '-statusbar' : ''}.png`
    }

    const button = await driver.element(buttonSelector)
    await button.click()

    const screenshot = await screenshoter({
      logger,
      driver,
      fully: true,
      framed: true,
      scrollingMode: 'scroll',
      wait: 1500,
      ...options,
    })
    try {
      if (options.withStatusBar) await sanitizeStatusBar(screenshot.image)
      const actual = await screenshot.image.toObject()
      const expected = await makeImage(expectedPath).toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_app_failed', suffix: Date.now()})
      throw err
    }
  }
  async function region(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      region: {x: 30, y: 500, height: 100, width: 200},
      scrollingMode: 'scroll',
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/android/region.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'region_failed', suffix: Date.now()})
      throw err
    }
  }
  async function fullRegion(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      region: {x: 30, y: 10, height: 700, width: 200},
      fully: true,
      scrollingMode: 'scroll',
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/android/region-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_region_failed', suffix: Date.now()})
      throw err
    }
  }
  async function element(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      region: {type: 'id', selector: 'btn_recycler_view'},
      scrollingMode: 'scroll',
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/android/element.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'element_failed', suffix: Date.now()})
      throw err
    }
  }
  async function fullElement(options) {
    const button = await driver.element({
      type: 'id',
      selector: 'btn_recycler_view_in_scroll_view_activity',
    })
    await button.click()

    const screenshot = await screenshoter({
      logger,
      driver,
      region: {type: 'id', selector: 'recyclerView'},
      fully: true,
      scrollingMode: 'scroll',
      wait: 1500,
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/android/x-element-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_element_failed', suffix: Date.now()})
      throw err
    }
  }
})
