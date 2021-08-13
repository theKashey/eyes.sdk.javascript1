const assert = require('assert')
const pixelmatch = require('pixelmatch')
const {Driver} = require('@applitools/driver')
const spec = require('../util/spec-driver')
const makeImage = require('../../src/image')
const screenshoter = require('../../index')

describe('screenshoter ios', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, browser, destroyBrowser

  async function sanitizeStatusBar(image) {
    const leftPatchImage = makeImage({
      width: 50,
      height: 16,
      data: Buffer.alloc(50 * 16 * 4, Buffer.from([0, 0xed, 0xed, 0xff])),
    })
    await image.copy(leftPatchImage, {x: 18, y: 15})
    const rightPatchImage = makeImage({
      width: 75,
      height: 16,
      data: Buffer.alloc(75 * 16 * 4, Buffer.from([0, 0xed, 0xed, 0xff])),
    })
    await image.copy(rightPatchImage, {x: 290, y: 15})
  }

  before(async () => {
    ;[browser, destroyBrowser] = await spec.build({type: 'ios'})
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

  it('take full app screenshot (table view)', () => {
    return fullApp({type: 'table'})
  })

  it('take full app screenshot (collection view)', () => {
    return fullApp({type: 'collection'})
  })

  it('take region screenshot', () => {
    return region()
  })

  it.skip('take full region screenshot', () => {
    return fullRegion()
  })

  it('take element screenshot', () => {
    return element()
  })

  it('take full element screenshot', () => {
    return fullElement()
  })

  async function app(options = {}) {
    const expectedPath = `./test/fixtures/ios/app${options.withStatusBar ? '-statusbar' : ''}.png`

    const screenshot = await screenshoter({logger, driver, ...options})
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
  async function fullApp({type, ...options} = {}) {
    let buttonSelector, expectedPath
    if (type === 'collection') {
      buttonSelector = {type: 'accessibility id', selector: 'Collection view'}
      expectedPath = `./test/fixtures/ios/app-fully-collection${options.withStatusBar ? '-statusbar' : ''}.png`
    } else if (type === 'table') {
      buttonSelector = {type: 'accessibility id', selector: 'Table view'}
      expectedPath = `./test/fixtures/ios/app-fully-table${options.withStatusBar ? '-statusbar' : ''}.png`
    } else {
      buttonSelector = {type: 'accessibility id', selector: 'Scroll view'}
      expectedPath = `./test/fixtures/ios/app-fully-scroll${options.withStatusBar ? '-statusbar' : ''}.png`
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
      wait: 1500,
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/ios/region.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'region_failed'})
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
      const expected = await makeImage('./test/fixtures/ios/region-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_region_failed'})
      throw err
    }
  }
  async function element(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      region: {type: 'accessibility id', selector: 'Table view'},
      scrollingMode: 'scroll',
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/ios/element.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'element_failed'})
      throw err
    }
  }
  async function fullElement(options) {
    const button = await driver.element({
      type: 'accessibility id',
      selector: 'Scroll view with nested table',
    })
    await button.click()

    const screenshot = await screenshoter({
      logger,
      driver,
      region: {type: 'xpath', selector: '//XCUIElementTypeTable[1]'},
      fully: true,
      scrollingMode: 'scroll',
      wait: 1500,
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/ios/element-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_element_failed'})
      throw err
    }
  }
})
