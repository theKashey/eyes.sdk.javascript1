const assert = require('assert')
const pixelmatch = require('pixelmatch')
const spec = require('@applitools/spec-driver-webdriverio')
const {Driver} = require('@applitools/driver')
const makeImage = require('../../src/image')
const takeScreenshot = require('../../src/take-screenshot')

exports.makeDriver = async function makeDriver({type, x, local = true, orientation, logger}) {
  const envs = {
    'ios-web': {
      url: 'https://ondemand.saucelabs.com/wd/hub',
      capabilities: {
        name: 'iOS Web Screenshoter Test',
        deviceName: 'iPhone 11 Pro Simulator',
        browserName: 'safari',
        platformName: 'iOS',
        platformVersion: '14.5',
        appiumVersion: '1.20.1',
        automationName: 'XCUITest',
        deviceOrientation: orientation ? orientation.toUpperCase() : 'PORTRAIT',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
      },
    },
    'ios-web-local': {
      url: 'http://0.0.0.0:4723/wd/hub',
      capabilities: {
        deviceName: 'iPhone 11 Pro',
        browserName: 'safari',
        platformName: 'iOS',
        platformVersion: '14.5',
        automationName: 'XCUITest',
        orientation: orientation ? orientation.toUpperCase() : 'PORTRAIT',
      },
    },
    android: {
      url: 'https://ondemand.saucelabs.com/wd/hub',
      capabilities: {
        name: 'Android Screenshoter Test',
        browserName: '',
        platformName: 'Android',
        platformVersion: '7.0',
        appiumVersion: '1.20.2',
        deviceName: 'Samsung Galaxy S8 FHD GoogleAPI Emulator',
        automationName: 'uiautomator2',
        deviceOrientation: orientation ? orientation.toUpperCase() : 'PORTRAIT',
        app: 'https://applitools.jfrog.io/artifactory/Examples/android/1.3/app-debug.apk',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
      },
    },
    'android-local': {
      url: 'http://0.0.0.0:4723/wd/hub',
      capabilities: {
        avd: 'Pixel_3a_XL',
        deviceName: 'Google Pixel 3a XL',
        platformName: 'Android',
        platformVersion: '10.0',
        automationName: 'uiautomator2',
        nativeWebScreenshot: true,
        orientation: orientation ? orientation.toUpperCase() : 'PORTRAIT',
        app: 'https://applitools.jfrog.io/artifactory/Examples/android/1.3/app-debug.apk',
      },
    },
    'android-x': {
      url: 'https://ondemand.saucelabs.com/wd/hub',
      capabilities: {
        name: 'AndroidX Screenshoter Test',
        browserName: '',
        platformName: 'Android',
        platformVersion: '10.0',
        appiumVersion: '1.20.2',
        deviceName: 'Google Pixel 3a XL GoogleAPI Emulator',
        automationName: 'uiautomator2',
        deviceOrientation: orientation ? orientation.toUpperCase() : 'PORTRAIT',
        app: 'https://applitools.jfrog.io/artifactory/Examples/androidx/1.3.1/app_androidx.apk',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
      },
    },
    'android-x-local': {
      url: 'http://0.0.0.0:4723/wd/hub',
      capabilities: {
        avd: 'Pixel_3a_XL',
        deviceName: 'Google Pixel 3a XL',
        platformName: 'Android',
        platformVersion: '10.0',
        automationName: 'uiautomator2',
        orientation: orientation ? orientation.toUpperCase() : 'PORTRAIT',
        app: 'https://applitools.jfrog.io/artifactory/Examples/androidx/1.3.3/app_androidx.apk',
      },
    },
    ios: {
      url: 'https://ondemand.saucelabs.com/wd/hub',
      capabilities: {
        name: 'iOS Screenshoter Test',
        deviceName: 'iPhone 11 Pro Simulator',
        platformName: 'iOS',
        platformVersion: '14.5',
        appiumVersion: '1.21.0',
        automationName: 'XCUITest',
        deviceOrientation: orientation ? orientation.toUpperCase() : 'PORTRAIT',
        app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp/1.9/app/IOSTestApp.zip',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
      },
    },
    'ios-local': {
      url: 'http://0.0.0.0:4723/wd/hub',
      capabilities: {
        deviceName: 'iPhone 11 Pro',
        platformName: 'iOS',
        platformVersion: '14.5',
        automationName: 'XCUITest',
        orientation: orientation ? orientation.toUpperCase() : 'PORTRAIT',
        app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp/1.9/app/IOSTestApp.zip',
      },
    },
  }
  const [browser, destroyBrowser] = await spec.build(envs[`${type}${x ? '-x' : ''}${local ? '-local' : ''}`])
  return [await new Driver({driver: browser, spec, logger}).init(), destroyBrowser]
}

async function sanitizeAndroidStatusBar(image) {
  const leftPatchImage = makeImage({
    width: 120,
    height: 18,
    data: Buffer.alloc(120 * 18 * 4, Buffer.from([0, 0xed, 0xed, 0xff])),
  })
  await image.copy(leftPatchImage, {x: 18, y: 3})
  const rightPatchImage = makeImage({
    width: 50,
    height: 18,
    data: Buffer.alloc(50 * 18 * 4, Buffer.from([0, 0xed, 0xed, 0xff])),
  })
  await image.copy(rightPatchImage, {x: 369, y: 3})
}

async function sanitizeIOSStatusBar(image) {
  const leftPatchImage = makeImage({
    width: 50,
    height: 16,
    data: Buffer.alloc(50 * 16 * 4, Buffer.from([0, 0xed, 0xed, 0xff])),
  })
  await image.copy(leftPatchImage, {x: 18, y: 15})
  const rightPatchImage = makeImage({
    width: 75,
    height: 16,
    data: Buffer.alloc(75 * 16 * 4, Buffer.from([0, 0xed, 0xed, 0xff])),
  })
  await image.copy(rightPatchImage, {x: 290, y: 15})
}

exports.test = async function test({type, tag, driver, ...options} = {}) {
  if (options.withStatusBar) tag += '-statusbar'

  const screenshot = await takeScreenshot({driver, ...options})
  try {
    if (options.withStatusBar) {
      if (type === 'android') await sanitizeAndroidStatusBar(screenshot.image)
      else if (type === 'ios') await sanitizeIOSStatusBar(screenshot.image)
    }
    const actual = await screenshot.image.toObject()
    const expected = await makeImage(`./test/fixtures/${type}/${tag}.png`).toObject()
    assert.strictEqual(pixelmatch(actual.data, expected.data, null, expected.width, expected.height), 0)
  } catch (err) {
    await screenshot.image.debug({path: './logs', name: `${type}-${tag}`})
    throw err
  }
}
