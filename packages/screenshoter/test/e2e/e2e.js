const assert = require('assert')
const pixelmatch = require('pixelmatch')
const utils = require('@applitools/utils')
const spec = require('@applitools/spec-driver-webdriverio')
const {Driver} = require('@applitools/driver')
const makeImage = require('../../src/image')
const takeScreenshot = require('../../src/take-screenshot')

async function sanitizeAndroidStatusBar(image) {
  const leftPatchImage = makeImage({
    width: 425,
    height: 17,
    data: Buffer.alloc(425 * 17 * 4, Buffer.from([0, 0xed, 0xed, 0xff])),
  })
  await image.copy(leftPatchImage, {x: 3, y: 3})
}

async function sanitizeIOSStatusBar(image) {
  const leftPatchImage = makeImage({
    width: 360,
    height: 17,
    data: Buffer.alloc(360 * 17 * 4, Buffer.from([0, 0xed, 0xed, 0xff])),
  })
  await image.copy(leftPatchImage, {x: 15, y: 15})
}

exports.sleep = utils.general.sleep

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
    await screenshot.image.debug({
      path: './logs',
      name: `${type}--${tag}` + (options.scrollingMode === 'css' ? '-css' : ''),
    })
    throw err
  }
}

exports.makeDriver = async function makeDriver({type, app, orientation, logger}) {
  const workerId = process.env.MOCHA_WORKER_ID ? Number(process.env.MOCHA_WORKER_ID) : 0
  const androidEmulatorIds = process.env.ANDROID_EMULATOR_UDID
    ? process.env.ANDROID_EMULATOR_UDID.split(',')
    : ['emulator-5554']
  const iosSimulatorIds = process.env.IOS_SIMULATOR_UDID ? process.env.IOS_SIMULATOR_UDID.split(',') : []
  const apps = {
    android: 'https://applitools.jfrog.io/artifactory/Examples/android/1.3/app-debug.apk',
    androidx: 'https://applitools.jfrog.io/artifactory/Examples/androidx/1.3.3/app_androidx.apk',
    ios: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp/1.9/app/IOSTestApp.zip',
  }

  const envs = {
    android: {
      url: 'http://0.0.0.0:4723/wd/hub',
      capabilities: {
        udid: androidEmulatorIds[workerId],
        systemPort: 8200 + workerId,
        chromedriverPort: 9515 + workerId,
        adbExecTimeout: 50000,
        isHeadless: true,
        browserName: app === 'chrome' ? app : '',
        app: apps[app || type],
        deviceName: 'Google Pixel 3a XL',
        platformName: 'Android',
        platformVersion: '10.0',
        automationName: 'uiautomator2',
        orientation: orientation ? orientation.toUpperCase() : 'PORTRAIT',
        nativeWebScreenshot: true,
      },
    },
    ios: {
      url: 'http://0.0.0.0:4723/wd/hub',
      capabilities: {
        udid: iosSimulatorIds[workerId],
        wdaLocalPort: 8100 + workerId,
        mjpegServerPort: 9100 + workerId,
        derivedDataPath: `~/Library/Developer/Xcode/DerivedData/Appium-${workerId}`,
        webviewConnectRetries: 12,
        usePrebuiltWDA: true,
        launchTimeout: 180000,
        isHeadless: true,
        browserName: app === 'safari' ? app : '',
        app: apps[app || type],
        deviceName: 'iPhone 12',
        platformName: 'iOS',
        platformVersion: '14.5',
        automationName: 'XCUITest',
        orientation: orientation ? orientation.toUpperCase() : 'PORTRAIT',
      },
    },
  }
  const [browser, destroyBrowser] = await spec.build(envs[type])
  return [await new Driver({driver: browser, spec, logger}).init(), destroyBrowser]
}
