const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter web', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'chrome', logger})
    await driver.visit('https://applitools.github.io/demo/TestPages/PageWithScrollableArea/')
    await driver.setViewportSize({width: 700, height: 460})
    await driver.currentContext.setScrollingElement('.wrapper')
  })

  beforeEach(async () => {
    await driver.visit('https://applitools.github.io/demo/TestPages/PageWithScrollableArea/')
  })

  after(async () => {
    await destroyDriver()
  })

  it('take region by element inside scrollable element', async () => {
    await test({
      type: 'web',
      tag: 'region-inside-scrollable-element',
      region: '#lipsum',
      driver,
      logger,
    })
  })

  it('take region by element inside scrollable element after manual scroll', async () => {
    await driver.execute(`document.querySelector('.wrapper').scrollTop = 200`)
    await test({
      type: 'web',
      tag: 'region-inside-scrollable-element',
      region: '#lipsum',
      driver,
      logger,
    })
  })

  it('take region by element inside scrollable element with "scroll" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'region-inside-scrollable-element',
      region: '#lipsum',
      driver,
      logger,
      scrollingMode: 'scroll',
    })
  })

  it('take region by element inside scrollable element after manual scroll with "scroll" scrolling', async () => {
    await driver.execute(`document.querySelector('.wrapper').scrollTop = 200`)
    await test({
      type: 'web',
      tag: 'region-inside-scrollable-element',
      region: '#lipsum',
      driver,
      logger,
      scrollingMode: 'scroll',
    })
  })

  it('take region by element inside scrollable element with "css" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'region-inside-scrollable-element-css',
      region: '#lipsum',
      driver,
      logger,
      scrollingMode: 'css',
    })
  })

  it('take region by element inside scrollable element after manual scroll with "css" scrolling', async () => {
    await driver.execute(`document.querySelector('.wrapper').scrollTop = 200`)
    await test({
      type: 'web',
      tag: 'region-inside-scrollable-element-css',
      region: '#lipsum',
      driver,
      logger,
      scrollingMode: 'css',
    })
  })

  // there is a bug in the stitching. run it and look at the logs to see it
  it.skip('take region by element inside scrollable element with force offset with fully', async () => {
    await driver.execute(`document.querySelector('.wrapper').scrollTop = 200`)
    await test({
      fully: true,
      type: 'web',
      tag: 'region-inside-scrollable-element-fully',
      region: '#lipsum',
      driver,
      logger,
    })
  })
})
