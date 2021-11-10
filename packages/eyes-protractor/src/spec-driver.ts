import type {Size, Cookie, DriverInfo} from '@applitools/types'
import type * as Protractor from 'protractor'
import * as utils from '@applitools/utils'

export type Driver = Protractor.ProtractorBrowser
export type Element = Protractor.WebElement | Protractor.ElementFinder
export type Selector = Protractor.Locator | {using: string; value: string}

type CommonSelector = string | {selector: Selector | string; type?: string}

// #region HELPERS

const byHash = ['className', 'css', 'id', 'js', 'linkText', 'name', 'partialLinkText', 'tagName', 'xpath']

function extractElementId(element: Element): Promise<string> {
  return element.getId() as Promise<string>
}

// #endregion

// #region UTILITY

export function isDriver(driver: any): driver is Driver {
  return utils.types.instanceOf(driver, 'ProtractorBrowser')
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
    utils.types.has(selector, ['using', 'value']) ||
    Object.keys(selector).some(key => byHash.includes(key)) ||
    utils.types.isFunction(selector.findElementsOverride)
  )
}
export function transformElement(element: Element): Element {
  if (!utils.types.instanceOf<Protractor.ElementFinder>(element, 'ElementFinder')) return element
  return element.getWebElement()
}
export function transformSelector(selector: Selector | CommonSelector): Selector {
  if (utils.types.isString(selector)) {
    return {css: selector}
  } else if (utils.types.has(selector, 'selector')) {
    if (!utils.types.isString(selector.selector)) return selector.selector
    if (!utils.types.has(selector, 'type')) return {css: selector.selector}
    if (selector.type === 'css') return {css: selector.selector}
    else return {using: selector.type, value: selector.selector}
  }
  return selector
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
  await driver.driver.switchToParentFrame()
  return driver
}
export async function childContext(driver: Driver, element: Element): Promise<Driver> {
  await driver.switchTo().frame(element)
  return driver
}
export async function findElement(driver: Driver, selector: Selector, parent?: Element): Promise<Element> {
  try {
    const {ElementFinder} = require('protractor')
    if (parent) return await ElementFinder.fromWebElement_(driver, parent).element(selector).getWebElement()
    else return await driver.element(selector).getWebElement()
  } catch (err) {
    if (err.name === 'NoSuchElementError') return null
    else throw err
  }
}
export async function findElements(driver: Driver, selector: Selector, parent?: Element): Promise<Element[]> {
  const {ElementFinder} = require('protractor')
  if (parent) return ElementFinder.fromWebElement_(driver, parent).all(selector).getWebElements()
  else return driver.element.all(selector).getWebElements()
}
export async function getWindowSize(driver: Driver): Promise<Size> {
  const size = await driver.manage().window().getSize()
  return {width: size.width, height: size.height}
}
export async function setWindowSize(driver: Driver, size: Size) {
  const window = driver.manage().window()
  await window.setPosition(0, 0)
  await window.setSize(size.width, size.height)
}
export async function getDriverInfo(driver: Driver): Promise<DriverInfo> {
  const session = await driver.getSession()
  const capabilities = await driver.getCapabilities()
  const desiredCapabilities = capabilities.get('desired') ?? {}
  const platformName =
    capabilities.get('platformName') ?? capabilities.get('platform') ?? desiredCapabilities.platformName
  const isMobile = ['android', 'ios'].includes(platformName?.toLowerCase())

  return {
    sessionId: session.getId(),
    isMobile,
    isNative: isMobile && !capabilities.get('browserName'),
    deviceName: desiredCapabilities.deviceName ?? capabilities.get('deviceName'),
    platformName,
    platformVersion: capabilities.get('platformVersion'),
    browserName: capabilities.get('browserName') ?? desiredCapabilities?.browserName,
    browserVersion: capabilities.get('browserVersion') ?? capabilities.get('version'),
  }
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

export async function getCookies(driver: Driver, context?: boolean): Promise<Cookie[]> {
  if (context) return driver.manage().getCookies()
  const {cookies} = (await driver.driver.sendChromiumCommandAndGetResult('Network.getAllCookies', {})) as any

  return cookies.map((cookie: any) => {
    const copy = {...cookie, expiry: cookie.expires}
    delete copy.expires
    delete copy.size
    delete copy.priority
    delete copy.session
    delete copy.sameParty
    delete copy.sourceScheme
    delete copy.sourcePort
    return copy
  })
}

// #endregion

// #region MOBILE COMMANDS

export async function getOrientation(driver: Driver): Promise<'portrait' | 'landscape'> {
  const orientation = await driver.driver.getScreenOrientation()
  return orientation.toLowerCase() as 'portrait' | 'landscape'
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
      if (browser !== 'firefox' && !browserOptions.mobileEmulation) browserOptions.w3c = false
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
