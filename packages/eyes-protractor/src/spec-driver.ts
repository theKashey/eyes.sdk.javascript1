import * as utils from '@applitools/utils'
import type * as Protractor from 'protractor'

export type Driver = Protractor.ProtractorBrowser
export type Element = Protractor.WebElement | Protractor.ElementFinder
export type Selector = Protractor.Locator | {using: string; value: string} | string | {type: string; selector: string}

// #region HELPERS

const byHash = ['className', 'css', 'id', 'js', 'linkText', 'name', 'partialLinkText', 'tagName', 'xpath']

function extractElementId(element: Element): Promise<string> {
  return element.getId() as Promise<string>
}
function transformSelector(selector: Selector): Protractor.Locator {
  if (utils.types.isString(selector)) {
    return {css: selector}
  } else if (utils.types.has(selector, ['type', 'selector'])) {
    if (selector.type === 'css') return {css: selector.selector}
    else if (selector.type === 'xpath') return {xpath: selector.selector}
  }
  return selector
}

// #endregion

// #region UTILITY

export function isDriver(driver: any): driver is Driver {
  return utils.types.instanceOf<Driver>(driver, 'ProtractorBrowser')
}
export function isElement(element: any): element is Element {
  return (
    utils.types.instanceOf<Protractor.WebElement>(element, 'WebElement') ||
    utils.types.instanceOf<Protractor.ElementFinder>(element, 'ElementFinder')
  )
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return (
    utils.types.isString(selector) ||
    utils.types.has(selector, ['type', 'selector']) ||
    utils.types.has(selector, ['using', 'value']) ||
    Object.keys(selector).some(key => byHash.includes(key)) ||
    utils.types.isFunction(selector.findElementsOverride)
  )
}
export function transformDriver(driver: Driver): Driver {
  driver.getExecutor().defineCommand('getSessionDetails', 'GET', '/session/:sessionId')
  driver.getExecutor().defineCommand('getOrientation', 'GET', '/session/:sessionId/orientation')
  driver.getExecutor().defineCommand('getElementRect', 'GET', '/session/:sessionId/elements/:elementId/rect')
  driver.getExecutor().defineCommand('performTouch', 'POST', '/session/:sessionId/touch/perform')
  driver.getExecutor().defineCommand('switchToParentFrame', 'POST', '/session/:sessionId/frame/parent')
  return driver
}
export function transformElement(element: Element): Element {
  if (!utils.types.instanceOf<Protractor.ElementFinder>(element, 'ElementFinder')) return element
  return element.getWebElement()
}
export function isStaleElementError(error: any): boolean {
  if (!error) return false
  error = error.originalError || error
  return error instanceof Error && error.name === 'StaleElementReferenceError'
}
export async function isEqualElements(_driver: Driver, element1: Element, element2: Element): Promise<boolean> {
  if (!element1 || !element2) return false
  const elementId1 = await extractElementId(element1)
  const elementId2 = await extractElementId(element2)
  return elementId1 === elementId2
}

// #endregion

// #region COMMANDS

export async function executeScript(driver: Driver, script: ((arg: any) => any) | string, arg: any): Promise<any> {
  return driver.executeScript(script, arg)
}
export async function mainContext(driver: Driver): Promise<Driver> {
  await driver.switchTo().defaultContent()
  return driver
}
export async function parentContext(driver: Driver): Promise<Driver> {
  const {Command} = require('protractor')
  await driver.schedule(new Command('switchToParentFrame'), '')
  return driver
}
export async function childContext(driver: Driver, element: Element): Promise<Driver> {
  await driver.switchTo().frame(element)
  return driver
}
export async function findElement(driver: Driver, selector: Selector): Promise<Element> {
  try {
    return await driver.findElement(transformSelector(selector))
  } catch (err) {
    if (err.name === 'NoSuchElementError') return null
    else throw err
  }
}
export async function findElements(driver: Driver, selector: Selector): Promise<Element[]> {
  return driver.findElements(transformSelector(selector))
}
export async function getWindowSize(driver: Driver): Promise<{width: number; height: number}> {
  const size = await driver.manage().window().getSize()
  return {width: size.width, height: size.height}
}
export async function setWindowSize(driver: Driver, size: {width: number; height: number}) {
  const window = driver.manage().window()
  await window.setPosition(0, 0)
  await window.setSize(size.width, size.height)
}
export async function getDriverInfo(driver: Driver): Promise<any> {
  const session = await driver.getSession()
  const capabilities = await driver.getCapabilities()
  const desiredCapabilities = capabilities.get('desired') ?? {}
  const platformName =
    capabilities.get('platformName') ?? capabilities.get('platform') ?? desiredCapabilities.platformName
  const isMobile = ['android', 'ios'].includes(platformName?.toLowerCase())

  const info: any = {
    sessionId: session.getId(),
    isMobile,
    isNative: isMobile && !capabilities.get('browserName'),
    deviceName: desiredCapabilities.deviceName ?? capabilities.get('deviceName'),
    platformName,
    platformVersion: capabilities.get('platformVersion'),
    browserName: capabilities.get('browserName') ?? desiredCapabilities.browserName,
    browserVersion: capabilities.get('browserVersion') ?? capabilities.get('version'),
  }

  if (info.isNative) {
    let details: any
    if (capabilities.has('viewportRect') && capabilities.has('pixelRatio')) {
      details = {viewportRect: capabilities.get('viewportRect'), pixelRatio: capabilities.get('pixelRatio')}
    } else {
      const {Command} = require('protractor')
      details = await driver.schedule(new Command('getSessionDetails'), '')
    }

    info.pixelRatio = details.pixelRatio
    if (details.viewportRect) {
      info.viewportRegion = {
        x: details.viewportRect.left,
        y: details.viewportRect.top,
        width: details.viewportRect.width,
        height: details.viewportRect.height,
      }
    }
  }
  return info
}
export async function getTitle(driver: Driver): Promise<string> {
  return driver.getTitle()
}
export async function getUrl(driver: Driver): Promise<string> {
  return driver.getCurrentUrl()
}
export async function visit(driver: Driver, url: string): Promise<void> {
  await driver.get(url)
}
export async function takeScreenshot(driver: Driver): Promise<string> {
  return driver.takeScreenshot()
}
export async function click(driver: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await (element as Element).click()
}
export async function hover(driver: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await driver
    .actions()
    .mouseMove(element as Element)
    .perform()
}
export async function type(driver: Driver, element: Element | Selector, keys: string): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await (element as Element).sendKeys(keys)
}
export async function scrollIntoView(driver: Driver, element: Element | Selector, align = false): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await driver.executeScript('arguments[0].scrollIntoView(arguments[1])', element, align)
}
export async function waitUntilDisplayed(driver: Driver, selector: Selector, timeout: number): Promise<void> {
  const {until} = require('protractor')
  const element = await findElement(driver, selector)
  await driver.wait(until.elementIsVisible(element), timeout)
}

// #endregion

// #region MOBILE COMMANDS

export async function getOrientation(driver: Driver): Promise<'portrait' | 'landscape'> {
  const {Command} = require('protractor')
  const orientation: string = await driver.schedule(new Command('getOrientation'), '')
  return orientation.toLowerCase() as 'portrait' | 'landscape'
}
export async function getElementRegion(
  driver: Driver,
  element: Element,
): Promise<{x: number; y: number; width: number; height: number}> {
  const {Command} = require('protractor')
  return driver.schedule(new Command('getElementRect').setParameters({elementId: await extractElementId(element)}), '')
}
export async function getElementAttribute(_driver: Driver, element: Element, attr: string): Promise<string> {
  return element.getAttribute(attr)
}
export async function getElementText(_driver: Driver, element: Element): Promise<string> {
  return element.getText()
}
export async function performAction(driver: Driver, steps: any[]): Promise<void> {
  const {Command} = require('protractor')
  await driver.schedule(
    new Command('performTouch').setParameters({actions: steps.map(({action, ...options}) => ({action, options}))}),
    '',
  )
}

// #endregion

// #region TESTING

const browserOptionsNames: Record<string, string> = {
  chrome: 'goog:chromeOptions',
  firefox: 'moz:firefoxOptions',
}
export async function build(env: any): Promise<[Driver, () => Promise<void>]> {
  const {Builder, Runner} = require('protractor')
  const parseEnv = require('@applitools/test-utils/src/parse-env')

  const {
    browser = '',
    capabilities,
    url,
    attach,
    proxy,
    configurable = true,
    appium = false,
    args = [],
    headless,
    logLevel = 'silent',
  } = parseEnv({...env, legacy: true})

  const desiredCapabilities = {browserName: browser, ...capabilities}
  if (configurable) {
    const browserOptionsName = browserOptionsNames[desiredCapabilities.browserName]
    if (browserOptionsName) {
      const browserOptions = desiredCapabilities[browserOptionsName] || {}
      browserOptions.args = [...(browserOptions.args || []), ...args]
      if (headless) browserOptions.args.push('headless')
      if (attach) {
        browserOptions.debuggerAddress = attach === true ? 'localhost:9222' : attach
      }
      desiredCapabilities[browserOptionsName] = browserOptions
    }
  }
  if (appium && browser === 'chrome') {
    desiredCapabilities['appium:chromeOptions'] = {w3c: false}
  }
  const builder = new Builder().withCapabilities(desiredCapabilities)
  if (url && !attach) builder.usingServer(url.href)
  if (proxy) {
    builder.setProxy({
      proxyType: 'manual',
      httpProxy: proxy.http || proxy.server,
      sslProxy: proxy.https || proxy.server,
      ftpProxy: proxy.ftp,
      noProxy: proxy.bypass,
    })
  }
  const runner = new Runner({
    seleniumWebDriver: builder.build(),
    logLevel: logLevel.toUpperCase(),
    allScriptsTimeout: 60000,
    getPageTimeout: 10000,
  })
  const driver = await runner.createBrowser().ready
  driver.by = driver.constructor.By
  driver.waitForAngularEnabled(false)
  return [driver, () => driver.quit()]
}

// #endregion
