const {expect} = require('chai')
const {getViewportSize} = require('@applitools/snippets')
const setupTests = require('./utils/core-e2e-utils')

const UFG_MAX_WIDTH_HEIGHT_SIZE = 5120
describe('eyes visual gird', () => {
  const {getDriver, getSDK} = setupTests({
    before,
    after,
    beforeEach,
    afterEach,
    env: {browser: 'chrome', headless: false},
  })

  it.skip('should not throw error when the browser width or height size are greater then the screen size and less then the UFG max width/height size', async () => {
    const sdk = getSDK()
    const driver = getDriver()
    const manager = await sdk.makeManager({type: 'vg', concurrency: 5})

    const eyes = await manager.openEyes({
      driver,
      config: {
        appName: 'core e2e eyes visual grid',
        testName: 'viewport size greater then screen size',
        browsersInfo: [
          {
            width: UFG_MAX_WIDTH_HEIGHT_SIZE - 1,
            height: UFG_MAX_WIDTH_HEIGHT_SIZE - 1,
            name: 'chrome',
            headless: false,
          },
        ],
      },
    })
    await driver.get('https://example.org')
    await eyes.check()
    const actualViewportSize = await driver.executeScript(getViewportSize)
    await eyes.close({throwErr: true})
    expect(actualViewportSize.width).to.be.lessThan(UFG_MAX_WIDTH_HEIGHT_SIZE - 1)
    expect(actualViewportSize.height).to.be.lessThan(UFG_MAX_WIDTH_HEIGHT_SIZE - 1)
  })
})
