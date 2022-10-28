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
        selector: {selector: '#overflowing-div > img:nth-child(2)'},
      },
      {
        regions: [{region: {x: 322, y: 80, width: 310, height: 198}}],
        selector: {type: 'css', selector: '#overflowing-div > img:nth-child(3)'},
      },
      {
        regions: [{region: {x: 636, y: 80, width: 310, height: 198}}],
        selector: {selector: '#overflowing-div > img:nth-child(4)'},
      },
      {
        regions: [{region: {x: 322, y: 888, width: 310, height: 198}}],
        selector: {selector: '#overflowing-div > img:nth-child(15)'},
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
  it('extract coded regions coordinates with fully false', async () => {
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
        selector: {selector: '#overflowing-div > img:nth-child(2)'},
      },
      {
        regions: [{region: {x: 322, y: 80, width: 310, height: 198}}],
        selector: {type: 'css', selector: '#overflowing-div > img:nth-child(3)'},
      },
      {
        regions: [{region: {x: 636, y: 80, width: 310, height: 198}}],
        selector: {selector: '#overflowing-div > img:nth-child(4)'},
      },
      {
        regions: [{region: {x: 322, y: 888, width: 310, height: 198}}],
        selector: {selector: '#overflowing-div > img:nth-child(15)'},
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
        selector: {selector: '#overflowing-div > img:nth-child(21)'},
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
  it('extracts coded region in region', async () => {
    const page = `data:text/html,
      <div id='outer' style='margin-left: 50px; width:600px; height: 2000px; border: 1px solid;'>
        Outer
        <div id='inner' style='width: 200px; height: 200px; position:relative; margin-top: 500px;'>
          Inner
        </div>
      </div>`
    await driver.visit(page)
    const regionsToCalculate = ['#inner']
    const expectedCoordinates = [
      {
        regions: [{region: {x: 1, y: 519, width: 200, height: 200}}],
        selector: {selector: '#inner'},
      },
    ]
    await testCodedRegions(
      {
        type: 'web',
        tag: 'inner-element',
        region: '#outer',
        regionsToCalculate,
        driver,
        logger,
        fully: true,
      },
      expectedCoordinates,
    )
  })
})
