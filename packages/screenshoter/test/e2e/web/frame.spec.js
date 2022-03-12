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

  it('take frame screenshot with "scroll" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'frame',
      frames: [{reference: 'iframe[name="frame1"]'}],
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it('take frame screenshot with "css" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'frame',
      frames: [{reference: 'iframe[name="frame1"]'}],
      scrollingMode: 'css',
      driver,
      logger,
    })
  })
})
