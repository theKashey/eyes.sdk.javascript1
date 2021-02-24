const assert = require('assert')
const pixelmatch = require('pixelmatch')
const makeDriver = require('../util/driver')
const screenshoter = require('../../index')
const makeImage = require('../../src/image')

// TODO add overflowed regions tests

describe('screenshoter', () => {
  const logger = {log: () => null, verbose: () => null}
  let driver, destroyDriver

  beforeEach(async () => {
    ;[driver, destroyDriver] = await makeDriver()
    await driver.init()
    await driver.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/')
    await driver.setViewportSize({width: 700, height: 460})
  })

  afterEach(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot', () => {
    return viewport()
  })

  it('take full page screenshot with "scroll" scrolling', () => {
    return fullPage({scrollingMode: 'scroll'})
  })
  it('take full page screenshot with "css" scrolling', () => {
    return fullPage({scrollingMode: 'css'})
  })

  it('take frame screenshot with "scroll" scrolling', () => {
    frame({scrollingMode: 'scroll'})
  })
  it('take frame screenshot with "css" scrolling', () => {
    frame({scrollingMode: 'css'})
  })

  it('take full frame screenshot with "scroll" scrolling', () => {
    return fullFrame({scrollingMode: 'scroll'})
  })
  it('take full frame screenshot with "css" scrolling', () => {
    return fullFrame({scrollingMode: 'css'})
  })

  it('take region screenshot with "scroll" scrolling', () => {
    region({scrollingMode: 'scroll'})
  })
  it('take region screenshot with "css" scrolling', () => {
    region({scrollingMode: 'css'})
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

  async function viewport(options) {
    const screenshot = await screenshoter({logger, driver, ...options})
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/page.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullPage(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      fully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/page-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function frame(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/frame.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullFrame(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      fully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/frame-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function region(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: {x: 30, y: 500, height: 100, width: 200},
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/region.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullRegion(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: {x: 30, y: 500, height: 700, width: 200},
      fully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/region-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function element(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: '#overflowing-div-image',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/element.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullElement(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      target: '#overflowing-div-image',
      fully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/element-fully.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function regionInFrame(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      target: {x: 10, y: 20, width: 110, height: 120},
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/inner-region.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullRegionInFrame(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      target: {x: 10, y: 100, width: 1000, height: 120},
      fully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage(
      './test/fixtures/screenshoter/inner-region-fully.png',
    ).toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function elementInFrame(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      target: '#inner-frame-div',
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/inner-element.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullElementInFrame(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}],
      target: '#inner-frame-div',
      fully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage(
      './test/fixtures/screenshoter/inner-element-fully.png',
    ).toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function frameInFrame(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}, {reference: 'iframe[name="frame1-1"]'}],
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage('./test/fixtures/screenshoter/inner-frame.png').toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
  async function fullFrameInFrame(options) {
    const screenshot = await screenshoter({
      logger,
      driver,
      frames: [{reference: 'iframe[name="frame1"]'}, {reference: 'iframe[name="frame1-1"]'}],
      fully: true,
      ...options,
    })
    const actual = await screenshot.image.toObject()
    const expected = await makeImage(
      './test/fixtures/screenshoter/inner-frame-fully.png',
    ).toObject()
    assert.strictEqual(
      pixelmatch(actual.data, expected.data, null, expected.width, expected.height),
      0,
    )
  }
})
