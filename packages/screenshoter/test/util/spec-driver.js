const webdriverio = require('webdriverio')
const utils = require('@applitools/utils')

// #region HELPERS

const LEGACY_ELEMENT_ID = 'ELEMENT'
const ELEMENT_ID = 'element-6066-11e4-a52e-4f735466cecf'

function extractElementId(element) {
  return element.elementId || element[ELEMENT_ID] || element[LEGACY_ELEMENT_ID]
}

// #endregion

// #region UTILITY

function isDriver(browser) {
  if (!browser) return false
  return browser.constructor.name === 'Browser'
}
function isElement(element) {
  if (!element) return false
  return Boolean(element.elementId || element[ELEMENT_ID] || element[LEGACY_ELEMENT_ID])
}
function isSelector(selector) {
  return utils.types.isString(selector) || utils.types.isFunction(selector)
}
function transformElement(element) {
  const elementId = extractElementId(element)
  return {[ELEMENT_ID]: elementId, [LEGACY_ELEMENT_ID]: elementId}
}
function transformSelector(selector) {
  if (utils.types.has(selector, 'selector')) {
    if (!utils.types.has(selector, 'type')) return selector.selector
    if (selector.type === 'css') return `css selector:${selector.selector}`
    else return `${selector.type}:${selector.selector}`
  }
  return selector
}
function extractSelector(element) {
  return element.selector
}
async function isEqualElements(browser, element1, element2) {
  // NOTE: wdio wraps puppeteer and generate ids by itself just incrementing a counter
  // NOTE: appium for ios could return different ids for same element
  if (browser.isDevTools || browser.isIOS) {
    return browser.execute((element1, element2) => element1 === element2, element1, element2).catch(() => false)
  }
  if (!element1 || !element2) return false
  const elementId1 = extractElementId(element1)
  const elementId2 = extractElementId(element2)
  return elementId1 === elementId2
}

// #endregion

// #region COMMANDS

async function executeScript(browser, script, ...args) {
  return browser.execute(script, ...args)
}
async function mainContext(browser) {
  await browser.switchToFrame(null)
  return browser
}
async function parentContext(browser) {
  await browser.switchToParentFrame()
  return browser
}
async function childContext(browser, element) {
  await browser.switchToFrame(element)
  return browser
}
async function findElement(browser, selector) {
  const element = await browser.$(selector)
  return !element.error ? element : null
}
async function findElements(browser, selector) {
  const elements = await browser.$$(selector)
  return Array.from(elements)
}
async function getElementRegion(browser, element) {
  const extendedElement = await browser.$(element)
  if (utils.types.isFunction(extendedElement, 'getRect')) {
    return extendedElement.getRect()
  } else {
    const size = await extendedElement.getSize()
    const location = utils.types.has(size, ['x', 'y']) ? size : await extendedElement.getLocation()
    return {x: location.x, y: location.y, width: size.width, height: size.height}
  }
}
async function getElementAttribute(browser, element, name) {
  return browser.getElementAttribute(extractElementId(element), name)
}
async function getWindowSize(browser) {
  if (utils.types.isFunction(browser.getWindowRect)) {
    return browser.getWindowRect()
  } else if (utils.types.isFunction(browser.getWindowSize)) {
    return await browser.getWindowSize()
  }
}
async function setWindowSize(browser, {width, height} = {}) {
  if (utils.types.isFunction(browser.setWindowRect)) {
    await browser.setWindowRect(0, 0, width, height)
  } else {
    await browser.setWindowPosition(0, 0)
    await browser.setWindowSize(width, height)
  }
}
async function getOrientation(browser) {
  const orientation = await browser.getOrientation()
  return orientation.toLowerCase()
}
async function getDriverInfo(browser) {
  const driverInfo = {
    sessionId: browser.sessionId,
    isMobile: browser.isMobile,
    isNative: browser.isMobile && !browser.capabilities.browserName,
    deviceName: browser.capabilities.desired
      ? browser.capabilities.desired.deviceName
      : browser.capabilities.deviceName,
    platformName: browser.capabilities.platformName || browser.capabilities.platform,
    platformVersion: browser.capabilities.platformVersion,
    browserName: browser.capabilities.browserName,
    browserVersion: browser.capabilities.browserVersion,
    pixelRatio: browser.capabilities.pixelRatio,
  }

  if (driverInfo.isNative) {
    const capabilities = utils.types.has(browser.capabilities, ['pixelRatio', 'viewportRect', 'statBarHeight'])
      ? browser.capabilities
      : await browser.getSession()

    driverInfo.pixelRatio = capabilities.pixelRatio

    try {
      const {statusBar, navigationBar} = await browser.getSystemBars()
      driverInfo.statusBarHeight = statusBar.visible ? statusBar.height : 0
      driverInfo.navigationBarHeight = navigationBar.visible ? navigationBar.height : 0
    } catch (err) {
      driverInfo.statusBarHeight = capabilities.statBarHeight || (capabilities.viewportRect || {}).top || 0
      driverInfo.navigationBarHeight = 0
    }
  }

  return driverInfo
}
async function takeScreenshot(driver) {
  return driver.takeScreenshot()
}
async function visit(browser, url) {
  return browser.url(url)
}
async function click(browser, element) {
  if (isSelector(element)) element = await findElement(browser, element)
  const extendedElement = await browser.$(element)
  await extendedElement.click()
}
async function performAction(browser, actions) {
  return browser.touchAction(actions)
}
async function getElementText(browser, element) {
  return browser.getElementText(extractElementId(element))
}

// #endregion

async function build({type = 'web'} = {}) {
  const capabilities = {
    web: {
      protocol: 'http',
      hostname: 'localhost',
      path: '/wd/hub',
      port: 4444,
      logLevel: 'silent',
      capabilities: {
        browserName: 'chrome',
      },
    },
    android: {
      protocol: 'https',
      hostname: 'ondemand.saucelabs.com',
      path: '/wd/hub',
      port: 443,
      logLevel: 'silent',
      capabilities: {
        name: 'Android Screenshoter Test',
        browserName: '',
        platformName: 'Android',
        platformVersion: '7.0',
        appiumVersion: '1.20.2',
        deviceName: 'Samsung Galaxy S8 FHD GoogleAPI Emulator',
        automationName: 'uiautomator2',
        app: 'https://applitools.jfrog.io/artifactory/Examples/android/1.3/app-debug.apk',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
      },
    },
    androidx: {
      protocol: 'https',
      hostname: 'ondemand.saucelabs.com',
      path: '/wd/hub',
      port: 443,
      logLevel: 'silent',
      capabilities: {
        name: 'AndroidX Screenshoter Test',
        browserName: '',
        platformName: 'Android',
        platformVersion: '10.0',
        appiumVersion: '1.20.2',
        deviceName: 'Google Pixel 3a XL GoogleAPI Emulator',
        automationName: 'uiautomator2',
        app: 'https://applitools.jfrog.io/artifactory/Examples/androidx/1.2.0/app_androidx.apk',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
      },
    },
    ios: {
      protocol: 'https',
      hostname: 'ondemand.saucelabs.com',
      path: '/wd/hub',
      port: 443,
      logLevel: 'silent',
      capabilities: {
        name: 'iOS Screenshoter Test',
        deviceName: 'iPhone 11 Pro Simulator',
        platformName: 'iOS',
        platformVersion: '13.4',
        appiumVersion: '1.19.2',
        automationName: 'XCUITest',
        app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp/1.5/app/IOSTestApp-1.5.zip',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
      },
    },
    'web-ios': {
      protocol: 'https',
      hostname: 'ondemand.saucelabs.com',
      path: '/wd/hub',
      port: 443,
      logLevel: 'silent',
      capabilities: {
        name: 'iOS Web Screenshoter Test',
        deviceName: 'iPhone 11 Pro Simulator',
        browserName: 'safari',
        platformName: 'iOS',
        platformVersion: '14.5',
        appiumVersion: '1.20.1',
        automationName: 'XCUITest',
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
      },
    },
  }

  const browser = await webdriverio.remote(capabilities[type])

  return [browser, () => browser.deleteSession()]
}

module.exports = {
  isDriver,
  isElement,
  isSelector,
  transformElement,
  transformSelector,
  extractSelector,
  isEqualElements,
  executeScript,
  mainContext,
  parentContext,
  childContext,
  findElement,
  findElements,
  getElementRegion,
  getElementAttribute,
  getWindowSize,
  setWindowSize,
  getOrientation,
  getDriverInfo,
  takeScreenshot,
  visit,
  click,
  performAction,
  getElementText,

  build,
}
