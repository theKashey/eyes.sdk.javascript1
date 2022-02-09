const assert = require('assert')
const pixelmatch = require('pixelmatch')
const {Driver} = require('@applitools/driver')
const spec = require('@applitools/spec-driver-webdriverio')
const takeScreenshot = require('../../index')
const makeImage = require('../../src/image')

const env = {
  url: 'http://localhost:4444/wd/hub',
  capabilities: {
    browserName: 'chrome',
  },
}

// TODO add overflowed regions tests

describe('screenshoter web', () => {
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
    await driver.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/')
    await driver.setViewportSize({width: 700, height: 460})
  })

  it('take frame screenshot with "scroll" scrolling', () => {
    return frame({scrollingMode: 'scroll'})
  })
  it('take frame screenshot with "css" scrolling', () => {
    return frame({scrollingMode: 'css'})
  })

  it('take full frame screenshot with "scroll" scrolling', () => {
    return fullFrame({scrollingMode: 'scroll'})
  })
  it('take full frame screenshot with "css" scrolling', () => {
    return fullFrame({scrollingMode: 'css'})
  })

  it('take region screenshot with "scroll" scrolling', () => {
    return region({scrollingMode: 'scroll'})
  })
  it('take region screenshot with "css" scrolling', () => {
    return region({scrollingMode: 'css'})
  })

  it('take full region screenshot with "scroll" scrolling', () => {
    return fullRegion({scrollingMode: 'scroll'})
  })
  it('take full region screenshot with "css" scrolling', () => {
    return fullRegion({scrollingMode: 'css'})
  })

  it('take element screenshot with "scroll" scrolling', () => {
    return element({scrollingMode: 'scroll'})
  })
  it('take element screenshot with "css" scrolling', () => {
    return element({scrollingMode: 'css'})
  })

  it('take full element screenshot with "scroll" scrolling', () => {
    return fullElement({scrollingMode: 'scroll'})
  })
  it('take full element screenshot with "css" scrolling', () => {
    return fullElement({scrollingMode: 'css'})
  })

  it('take region in frame screenshot with "scroll" scrolling', () => {
    return regionInFrame({scrollingMode: 'scroll'})
  })
  it('take region in frame screenshot with "css" scrolling', () => {
    return regionInFrame({scrollingMode: 'css'})
  })

  it('take full region in frame screenshot with "scroll" scrolling', () => {
    return fullRegionInFrame({scrollingMode: 'scroll'})
  })
  it('take full region in frame screenshot with "css" scrolling', () => {
    return fullRegionInFrame({scrollingMode: 'css'})
  })

  it('take element in frame screenshot with "scroll" scrolling', () => {
    return elementInFrame({scrollingMode: 'scroll'})
  })
  it('take element in frame screenshot with "css" scrolling', () => {
    return elementInFrame({scrollingMode: 'css'})
  })

  it('take full element in frame screenshot with "scroll" scrolling', () => {
    return fullElementInFrame({scrollingMode: 'scroll'})
  })
  it('take full element in frame screenshot with "css" scrolling', () => {
    return fullElementInFrame({scrollingMode: 'css'})
  })

  it('take frame in frame screenshot with "scroll" scrolling', () => {
    return frameInFrame({scrollingMode: 'scroll'})
  })
  it('take frame in frame screenshot with "css" scrolling', () => {
    return frameInFrame({scrollingMode: 'css'})
  })

  it('take full frame in frame screenshot with "scroll" scrolling', () => {
    return fullFrameInFrame({scrollingMode: 'scroll'})
  })
  it('take full frame in frame screenshot with "css" scrolling', () => {
    return fullFrameInFrame({scrollingMode: 'css'})
  })

  async function frame(options) {
    const screenshot = await takeScreenshot({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/frame.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'frame_failed'})
      throw err
    }
  }
  async function fullFrame(options) {
    const screenshot = await takeScreenshot({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      fully: true,
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/frame-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_frame_failed'})
      throw err
    }
  }
  async function region(options) {
    const region = {x: 30, y: 500, height: 100, width: 200}
    const screenshot = await takeScreenshot({logger, driver, region, ...options})
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/region.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'region_failed'})
      throw err
    }
  }
  async function fullRegion(options) {
    const region = {x: 30, y: 500, height: 700, width: 200}
    const screenshot = await takeScreenshot({logger, driver, region, fully: true, ...options})
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/region-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_region_failed'})
      throw err
    }
  }
  async function element(options) {
    const screenshot = await takeScreenshot({logger, driver, region: '#overflowing-div-image', ...options})
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/element.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'element_failed'})
      throw err
    }
  }
  async function fullElement(options) {
    const screenshot = await takeScreenshot({logger, driver, region: '#overflowing-div-image', fully: true, ...options})
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/element-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_element_failed'})
      throw err
    }
  }
  async function regionInFrame(options) {
    const screenshot = await takeScreenshot({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      region: {x: 10, y: 20, width: 110, height: 120},
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/inner-region.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'region_in_frame_failed'})
      throw err
    }
  }
  async function fullRegionInFrame(options) {
    const screenshot = await takeScreenshot({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      region: {x: 10, y: 100, width: 1000, height: 120},
      fully: true,
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/inner-region-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_region_in_frame_failed'})
      throw err
    }
  }
  async function elementInFrame(options) {
    const screenshot = await takeScreenshot({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      region: '#inner-frame-div',
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/inner-element.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'element_in_frame_failed'})
      throw err
    }
  }
  async function fullElementInFrame(options) {
    const screenshot = await takeScreenshot({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      region: '#inner-frame-div',
      fully: true,
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/inner-element-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_element_in_frame_failed'})
      throw err
    }
  }
  async function frameInFrame(options) {
    const screenshot = await takeScreenshot({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}, {reference: 'iframe[name="frame1-1"]'}],
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/inner-frame.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'frame_in_frame_failed'})
      throw err
    }
  }
  async function fullFrameInFrame(options) {
    const screenshot = await takeScreenshot({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}, {reference: 'iframe[name="frame1-1"]'}],
      fully: true,
      ...options,
    })
    try {
      const actual = await screenshot.image.toObject()
      const expected = await makeImage('./test/fixtures/web/inner-frame-fully.png').toObject()
      assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
    } catch (err) {
      await screenshot.image.debug({path: './logs', name: 'full_frame_in_frame_failed'})
      throw err
    }
  }
})
