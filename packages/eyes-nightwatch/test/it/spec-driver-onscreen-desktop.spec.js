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
    it('getWindowRect()', async function (driver) {
      const rect = await driver.getWindowRect()
      const result = await spec.getWindowRect(driver)
      assert.deepStrictEqual(result, rect)
    })
    it('setWindowRect({x, y, width, height})', async function (driver) {
      const input = {
        x: 20,
        y: 30,
        width: 510,
        height: 511,
      }
      await spec.setWindowRect(driver, input)
      const rect = await spec.getWindowRect(driver)
      assert.deepStrictEqual(rect, input)
    })
    it('setWindowRect({x, y})', async function (driver) {
      const input = {
        x: 21,
        y: 31,
      }
      await spec.setWindowRect(driver, input)
      const rect = await spec.getWindowRect(driver)
      assert.deepStrictEqual(rect, {x: 21, y: 31, width: 510, height: 511})
    })
    it('setWindowRect({width, height})', async function (driver) {
      const input = {
        width: 551,
        height: 552,
      }
      await spec.setWindowRect(driver, input)
      const rect = await spec.getWindowRect(driver)
      assert.deepStrictEqual(rect, {x: 21, y: 31, width: 551, height: 552})
    })
  })
})
