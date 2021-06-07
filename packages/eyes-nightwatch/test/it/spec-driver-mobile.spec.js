const assert = require('assert')
const spec = require('../../dist/spec-driver')
const fakeCaps = require('./fixtures/fake-caps-android')

// NOTE: to run this against a real mobile configuration
// - comment out fakeCaps
// - run with: npx nightwatch --env browserstack.android test/it/spec-driver-mobile.spec.js

// TODO: test against iOS
describe('spec driver', async () => {
  describe('mobile driver (@mobile)', async () => {
    before(function (driver, done) {
      driver.options.desiredCapabilities = fakeCaps
      done()
    })
    after(function (driver, done) {
      return driver.end(function () {
        done()
      })
    })
    it('getOrientation()', async function (driver) {
      const result = await spec.getOrientation(driver)
      assert.strictEqual(result, 'portrait')
    })
    it('getDriverInfo()', async function (driver) {
      const info = await spec.getDriverInfo(driver)
      const expected = {
        browserName: 'chrome',
        isMobile: true,
        isNative: false,
        platformName: 'Android',
      }
      assert.deepStrictEqual(
        Object.keys(expected).reduce((obj, key) => ({...obj, [key]: info[key]}), {}),
        expected,
      )
    })
  })
})
