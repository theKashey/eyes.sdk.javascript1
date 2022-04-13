const setupTests = require('./utils/core-e2e-utils')
const assert = require('assert')
const utils = require('@applitools/utils')

describe('extractText e2e', () => {
  const {getDriver, getSDK} = setupTests({before, after, beforeEach, afterEach})

  it('works', async () => {
    const sdk = getSDK()
    const driver = getDriver()

    const manager = await sdk.makeManager()
    const eyes = await manager.openEyes({
      driver,
      config: {appName: 'core e2e', testName: 'extractText e2e test', viewportSize: {width: 700, height: 460}},
    })
    await driver.get('https://applitools.github.io/demo/TestPages/OCRPage')
    await utils.general.sleep(100) // yuck!
    const result = await eyes.extractText({
      regions: [
        {target: 'body > h1'},
        {target: {type: 'css', selector: 'body > h1'}},
        {target: {type: 'css selector', selector: 'body > h1'}},
      ],
    })
    assert.deepStrictEqual(result, ['Header 1: Hello world!', 'Header 1: Hello world!', 'Header 1: Hello world!'])
    await eyes.close({throwErr: true})
  })
})
