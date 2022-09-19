const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter web', () => {
  let driver, destroyDriver

  beforeEach(async () => {
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

  // there is a bug in the stitching. run it and look at the logs to see it
  it.skip('take element by selection inside scrollabe element with fully', async () => {
    await driver.visit('https://applitools.github.io/demo/TestPages/PageWithScrollableArea/')
    await driver.currentContext.setScrollingElement('.wrapper')
    await test({
      fully: true,
      type: 'web',
      tag: 'element-inside-scrollable-element',
      region: '#lipsum',
      driver,
      logger,
    })
  })

  // there is a bug in the stitching. run it and look at the logs to see it
  it.skip('take element by selection inside scrollabe element with fully and with "css" scrolling', async () => {
    await driver.visit('https://applitools.github.io/demo/TestPages/PageWithScrollableArea/')
    await driver.currentContext.setScrollingElement('.wrapper')
    await test({
      fully: true,
      type: 'web',
      tag: 'element-inside-scrollable-element',
      region: '#lipsum',
      scrollingMode: 'css',
      driver,
      logger,
    })
  })
})
