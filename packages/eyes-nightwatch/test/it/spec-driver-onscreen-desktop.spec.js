const assert = require('assert')
const spec = require('../../dist/spec-driver')

describe('spec driver', async () => {
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'
  describe('onscreen desktop (@webdriver)', async () => {
    before(function (driver, done) {
      driver.url(url)
      done()
    })
    after(function (driver, done) {
      return driver.end(function () {
        done()
      })
    })
    it('getWindowSize()', async function (driver) {
      const rect = await driver.getWindowRect()
      const result = await spec.getWindowSize(driver)
      assert.deepStrictEqual(result, {width: rect.width, height: rect.height})
    })
    it('setWindowSize({width, height})', async function (driver) {
      const input = {
        width: 551,
        height: 552,
      }
      await spec.setWindowSize(driver, input)
      const rect = await driver.getWindowRect()
      assert.deepStrictEqual(rect, {x: 0, y: 0, width: 551, height: 552})
    })
  })
})
