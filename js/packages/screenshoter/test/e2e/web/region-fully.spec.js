const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter web', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'chrome', logger})
    await driver.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/')
    await driver.setViewportSize({width: 700, height: 460})
  })

  beforeEach(async () => {
    await driver.execute(`document.querySelector('html').scrollTop = 0`)
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full region screenshot with "scroll" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'region-fully',
      region: {x: 30, y: 500, height: 700, width: 200},
      fully: true,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it('take full region screenshot after manual scroll with "scroll" scrolling', async () => {
    await driver.execute(`document.querySelector('html').scrollTop = 200`)
    await test({
      type: 'web',
      tag: 'region-fully',
      region: {x: 30, y: 500, height: 700, width: 200},
      fully: true,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it('take full region screenshot with "css" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'region-fully',
      region: {x: 30, y: 500, height: 700, width: 200},
      fully: true,
      scrollingMode: 'css',
      driver,
      logger,
    })
  })

  it('take full region screenshot after manual scroll with "css" scrolling', async () => {
    await driver.execute(`document.querySelector('html').scrollTop = 200`)
    await test({
      type: 'web',
      tag: 'region-fully',
      region: {x: 30, y: 500, height: 700, width: 200},
      fully: true,
      scrollingMode: 'css',
      driver,
      logger,
    })
  })
})
