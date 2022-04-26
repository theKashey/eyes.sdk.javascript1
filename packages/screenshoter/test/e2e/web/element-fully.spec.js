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

  it('take full element screenshot with "css" scrolling of an element with a position coordinate ending in .5px', async () => {
    await driver.visit(
      'data:text/html,<div style="position:absolute;left:50.5;top:12.80;width:942.98;height:3284.36;">blah</div>',
    )
    await driver.setViewportSize({width: 1200, height: 800})
    await test({
      type: 'web',
      tag: 'element-fully-half-px',
      region: 'div',
      fully: true,
      scrollingMode: 'css',
      driver,
      logger,
    })
  })
})
