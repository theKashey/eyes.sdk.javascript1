const playwright = require('playwright')
const {remote} = require('webdriverio')

const drivers = new Map()

exports.mochaHooks = {
  async beforeAll() {
    global.getDriver = async function(name) {
      let {driver} = drivers.get(name) || {}
      if (!driver) {
        if (name === 'chrome') {
          const browser = await playwright.chromium.launch()
          const context = await browser.newContext()
          driver = await context.newPage()
          await driver.setViewportSize({width: 800, height: 600})
          drivers.set('chrome', {driver, cleanup: () => browser.close()})
        } else if (name === 'firefox') {
          driver = await remote({
            protocol: 'https',
            hostname: 'ondemand.us-west-1.saucelabs.com',
            path: '/wd/hub',
            port: 443,
            logLevel: 'silent',
            capabilities: {
              browserName: 'firefox',
              //browserVersion: '11.285',
              platformName: 'Windows 10',
              'sauce:options': {
                name: 'Snippets tests',
                idleTimeout: 1000,
                username: process.env.SAUCE_USERNAME,
                accessKey: process.env.SAUCE_ACCESS_KEY,
              },
            },
            connectionRetryCount: 0,
            connectionRetryTimeout: 240000,
          })
          await driver.setWindowSize(816, 686)
          drivers.set('firefox', {driver, cleanup: () => driver.deleteSession()})
        } else if (name === 'internet explorer') {
          driver = await remote({
            protocol: 'https',
            hostname: 'ondemand.us-west-1.saucelabs.com',
            path: '/wd/hub',
            port: 443,
            logLevel: 'silent',
            capabilities: {
              browserName: 'internet explorer',
              browserVersion: '11.285',
              platformName: 'Windows 10',
              'sauce:options': {
                name: 'Snippets tests',
                idleTimeout: 1000,
                username: process.env.SAUCE_USERNAME,
                accessKey: process.env.SAUCE_ACCESS_KEY,
              },
            },
            connectionRetryCount: 0,
            connectionRetryTimeout: 240000,
          })
          await driver.setWindowSize(816, 686)
          drivers.set('internet explorer', {driver, cleanup: () => driver.deleteSession()})
        } else if (name === 'ios safari') {
          let options
          if (process.env.APPLITOOLS_TEST_REMOTE === 'local-appium') {
            options = {
              protocol: 'http',
              hostname: '0.0.0.0',
              path: '/wd/hub',
              port: 4723,
              logLevel: 'silent',
              capabilities: {
                name: 'Snippets tests',
                browserName: 'Safari',
                deviceName: 'iPhone XS',
                deviceOrientation: 'portrait',
                platformVersion: '15.5',
                platformName: 'iOS',
              },
              connectionRetryCount: 0,
            }
          } else {
            options = {
              protocol: 'https',
              hostname: 'ondemand.saucelabs.com',
              path: '/wd/hub',
              port: 443,
              logLevel: 'silent',
              capabilities: {
                browserName: 'Safari',
                platformName: 'iOS',
                'appium:platformVersion': '15.4',
                'appium:deviceName': 'iPhone XS Simulator',
                'sauce:options': {
                  name: 'Snippets tests',
                  deviceOrientation: 'portrait',
                  username: process.env.SAUCE_USERNAME,
                  accessKey: process.env.SAUCE_ACCESS_KEY,
                },
              },
              connectionRetryCount: 0,
              connectionRetryTimeout: 240000,
            }
          }
          driver = await remote(options)
          drivers.set('ios safari', {driver, cleanup: () => driver.deleteSession()})
        }
      }
      return driver
    }
  },

  async afterAll() {
    for (const {cleanup} of drivers.values()) {
      await cleanup()
    }
  },
}
