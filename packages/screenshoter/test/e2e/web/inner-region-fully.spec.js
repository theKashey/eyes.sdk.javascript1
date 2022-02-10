const {makeDriver, test} = require('../e2e')

describe('screenshoter web', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'chrome', logger})
    await driver.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/')
    await driver.setViewportSize({width: 700, height: 460})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full region in frame screenshot with "scroll" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'inner-region-fully',
      frames: [{reference: 'iframe[name="frame1"]'}],
      region: {x: 10, y: 100, width: 1000, height: 120},
      fully: true,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it('take full region in frame screenshot with "css" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'inner-region-fully',
      frames: [{reference: 'iframe[name="frame1"]'}],
      region: {x: 10, y: 100, width: 1000, height: 120},
      fully: true,
      scrollingMode: 'css',
      driver,
      logger,
    })
  })
})
