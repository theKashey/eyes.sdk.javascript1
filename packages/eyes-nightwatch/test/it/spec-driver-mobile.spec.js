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
    it('isMobile()', async function (driver) {
      const {isMobile} = await await spec.getDriverInfo(driver)
      assert.ok(isMobile)
    })
    it('getDeviceName()', async function (driver) {
      const {deviceName} = await spec.getDriverInfo(driver)
      assert.deepStrictEqual(deviceName, 'google pixel 2')
    })
    it('getPlatformName()', async function (driver) {
      const {platformName} = await spec.getDriverInfo(driver)
      assert.deepStrictEqual(platformName, 'Android')
    })
    // TODO: test on Sauce
    it('getPlatformVersion()', async function (driver) {
      const {platformVersion} = await spec.getDriverInfo(driver)
      assert.deepStrictEqual(platformVersion, '9.0')
    })
    // TODO: test w/ orientation set on BS (fake captured w/o it)
    // TODO: test on Sauce
    it('getOrientation()', async function (driver) {
      const result = await spec.getOrientation(driver)
      assert.strictEqual(result, 'portrait')
    })
    it('isNative()', async function (driver) {
      const {isNative} = await spec.getDriverInfo(driver)
      assert.strictEqual(isNative, true)
    })
  })
})
