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

  it('take full element screenshot with "scroll" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'element-fully',
      region: '#overflowing-div-image',
      fully: true,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it('take full element screenshot with "css" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'element-fully',
      region: '#overflowing-div-image',
      fully: true,
      scrollingMode: 'css',
      driver,
      logger,
    })
  })
})
