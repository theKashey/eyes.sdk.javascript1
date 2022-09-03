const {makeDriver, testCodedRegions, logger} = require('../e2e')

describe('coded regions', async () => {
  let driver, destroyDriver
  beforeEach(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'chrome', logger})
    await driver.visit('https://applitools.github.io/demo/TestPages/SimpleTestPage/index.html')
    await driver.setViewportSize({width: 1200, height: 800})
  })

  afterEach(async () => {
    await destroyDriver()
  })

  it('extract coded regions coordinates with fully true', async () => {
    const webElement = await driver.currentContext._spec.findElement(driver.target, {
      using: 'css selector',
      value: '#overflowing-div > img:nth-child(3)',
    })
    const regionsToCalculate = [
      {region: '#overflowing-div > img:nth-child(2)'},
      {region: webElement},
      {region: '#overflowing-div > img:nth-child(4)'},
      {region: '#overflowing-div > img:nth-child(15)'},
    ]
    const expectedCoordinates = [
      {
        regions: [{region: {x: 8, y: 80, width: 310, height: 198}}],
        commonSelector: {selector: '#overflowing-div > img:nth-child(2)'},
      },
      {
        regions: [{region: {x: 322, y: 80, width: 310, height: 198}}],
        commonSelector: {type: 'css', selector: '#overflowing-div > img:nth-child(3)'},
      },
      {
        regions: [{region: {x: 636, y: 80, width: 310, height: 198}}],
        commonSelector: {selector: '#overflowing-div > img:nth-child(4)'},
      },
      {
        regions: [{region: {x: 322, y: 888, width: 310, height: 198}}],
        commonSelector: {selector: '#overflowing-div > img:nth-child(15)'},
      },
    ]
    await testCodedRegions(
      {
        type: 'web',
        regionsToCalculate,
        driver,
        logger,
        fully: true,
      },
      expectedCoordinates,
    )
  })
  it('extract coded regions coordinates with fully fase', async () => {
    const webElement = await driver.currentContext._spec.findElement(driver.target, {
      using: 'css selector',
      value: '#overflowing-div > img:nth-child(3)',
    })
    const regionsToCalculate = [
      {region: '#overflowing-div > img:nth-child(2)'},
      {region: webElement},
      {region: '#overflowing-div > img:nth-child(4)'},
      {region: '#overflowing-div > img:nth-child(15)'},
    ]
    const expectedCoordinates = [
      {
        regions: [{region: {x: 8, y: 80, width: 310, height: 198}}],
        commonSelector: {selector: '#overflowing-div > img:nth-child(2)'},
      },
      {
        regions: [{region: {x: 322, y: 80, width: 310, height: 198}}],
        commonSelector: {type: 'css', selector: '#overflowing-div > img:nth-child(3)'},
      },
      {
        regions: [{region: {x: 636, y: 80, width: 310, height: 198}}],
        commonSelector: {selector: '#overflowing-div > img:nth-child(4)'},
      },
      {
        regions: [{region: {x: 322, y: 888, width: 310, height: 198}}],
        commonSelector: {selector: '#overflowing-div > img:nth-child(15)'},
      },
    ]
    await testCodedRegions(
      {
        type: 'web',
        regionsToCalculate,
        driver,
        logger,
        fully: false,
      },
      expectedCoordinates,
    )
  })
  it('extract coded regions coordinates with scrolling', async () => {
    await driver.execute(`document.querySelector('html').scrollTop = 800`)
    const regionsToCalculate = [{region: '#overflowing-div > img:nth-child(21)'}]
    const expectedCoordinates = [
      {
        regions: [{region: {x: 322, y: 492, width: 310, height: 198}}],
        commonSelector: {selector: '#overflowing-div > img:nth-child(21)'},
      },
    ]
    await testCodedRegions(
      {
        type: 'web',
        regionsToCalculate,
        driver,
        logger,
        fully: false,
      },
      expectedCoordinates,
    )
  })
})
