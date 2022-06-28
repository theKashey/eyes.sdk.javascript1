const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter web', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'chrome', logger})
    await driver.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/')
    await driver.setViewportSize({width: 700, height: 460})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take region in frame screenshot with "scroll" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'inner-region',
      frames: [{reference: 'iframe[name="frame1"]'}],
      region: {x: 10, y: 20, width: 110, height: 120},
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it('take region in frame screenshot with "css" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'inner-region',
      frames: [{reference: 'iframe[name="frame1"]'}],
      region: {x: 10, y: 20, width: 110, height: 120},
      scrollingMode: 'css',
      driver,
      logger,
    })
  })
})
