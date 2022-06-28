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

  it('take region screenshot with "scroll" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'region',
      region: {x: 30, y: 500, height: 100, width: 200},
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it('take region screenshot with "css" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'region',
      region: {x: 30, y: 500, height: 100, width: 200},
      scrollingMode: 'css',
      driver,
      logger,
    })
  })
})
