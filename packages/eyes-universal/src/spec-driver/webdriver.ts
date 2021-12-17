import type * as types from '@applitools/types'
import type * as WD from 'webdriver'
import * as utils from '@applitools/utils'
import WebDriver from 'webdriver'

export type Driver = WD.Client
export type Element = {'element-6066-11e4-a52e-4f735466cecf': string} | {ELEMENT: string}
export type Selector = {using: string; value: string}

type StaticDriver = {sessionId: string; serverUrl: string; capabilities: Record<string, any>}
type StaticElement = {elementId: string}
type CommonSelector = string | {selector: Selector | string; type?: string}

// #region HELPERS

const LEGACY_ELEMENT_ID = 'ELEMENT'
const ELEMENT_ID = 'element-6066-11e4-a52e-4f735466cecf'

const W3C_CAPABILITIES = ['platformName', 'platformVersion']
const W3C_SAFARI_CAPABILITIES = ['browserVersion', 'setWindowRect']
const APPIUM_CAPABILITIES = ['appiumVersion', 'deviceType', 'deviceOrientation', 'deviceName', 'automationName']
const LEGACY_APPIUM_CAPABILITIES = ['appium-version', 'device-type', 'device-orientation']
const CHROME_CAPABILITIES = ['chrome', 'goog:chromeOptions']
const MOBILE_BROWSER_NAMES = ['ipad', 'iphone', 'android']

function extractElementId(element: Element): string {
  return (element as any).elementId ?? (element as any)[ELEMENT_ID] ?? (element as any)[LEGACY_ELEMENT_ID]
}

function extractEnvironment(capabilities: Record<string, any>) {
  const isAppium = APPIUM_CAPABILITIES.some(capability => capabilities.hasOwnProperty(capability))
  const isChrome = CHROME_CAPABILITIES.some(capability => capabilities.hasOwnProperty(capability))
  const isW3C =
    isAppium ||
    W3C_CAPABILITIES.every(capability => capabilities.hasOwnProperty(capability)) ||
    W3C_SAFARI_CAPABILITIES.every(capability => capabilities.hasOwnProperty(capability))
  const isMobile =
    capabilities.browserName === '' ||
    isAppium ||
    LEGACY_APPIUM_CAPABILITIES.some(capability => capabilities.hasOwnProperty(capability)) ||
    MOBILE_BROWSER_NAMES.includes(capabilities.browserName?.toLowerCase())

  return {
    isW3C,
    isMobile,
    isChrome,
  }
}

// #endregion

// #region UTILITY

export function isDriver(driver: any): driver is Driver {
  if (!driver) return false
  return utils.types.has(driver, ['sessionId', 'serverUrl']) || utils.types.instanceOf<WD.Client>(driver, 'Browser')
}
export function isElement(element: any): element is Element {
  if (!element) return false
  return Boolean(extractElementId(element))
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return utils.types.has(selector, ['using', 'value'])
}
export function transformDriver(driver: Driver | StaticDriver): Driver {
  if (!utils.types.has(driver, ['sessionId', 'serverUrl'])) return driver
  const url = new URL(driver.serverUrl)

  const options: WD.AttachOptions = {
    sessionId: driver.sessionId,
    protocol: url.protocol ? url.protocol.replace(/:$/, '') : undefined,
    hostname: url.hostname,
    port: Number(url.port) || undefined,
    path: url.pathname,
    capabilities: driver.capabilities,
    logLevel: 'silent',
    ...extractEnvironment(driver.capabilities),
  }
  if (!options.port) {
    if (options.protocol === 'http') options.port = 80
    if (options.protocol === 'https') options.port = 443
  }
  return WebDriver.attachToSession(options)
}
export function transformElement(element: Element | StaticElement): Element {
  if (!utils.types.has(element, 'elementId')) return element
  return {'element-6066-11e4-a52e-4f735466cecf': element.elementId}
}
export function transformSelector(selector: Selector | CommonSelector): Selector {
  if (utils.types.isString(selector)) {
    return {using: 'css selector', value: selector}
  } else if (utils.types.has(selector, 'selector')) {
    if (!utils.types.isString(selector.selector)) return selector.selector
    if (!utils.types.has(selector, 'type')) return {using: 'css selector', value: selector.selector}
    if (selector.type === 'css') return {using: 'css selector', value: selector.selector}
    else return {using: selector.type, value: selector.selector}
  } else {
    return selector
  }
}
export function isStaleElementError(error: any): boolean {
  if (!error) return false
  const errOrResult = error.originalError || error
  return errOrResult instanceof Error && errOrResult.name === 'stale element reference'
}

// #endregion

// #region COMMANDS

export async function isEqualElements(_driver: Driver, element1: Element, element2: Element): Promise<boolean> {
  if (!element1 || !element2) return false
  const elementId1 = extractElementId(element1)
  const elementId2 = extractElementId(element2)
  return elementId1 === elementId2
}
export async function executeScript(driver: Driver, script: ((arg: any) => any) | string, arg: any): Promise<any> {
  script = utils.types.isFunction(script) ? `return (${script}).apply(null, arguments)` : script
  return driver.executeScript(script, [arg])
}
export async function mainContext(driver: Driver): Promise<Driver> {
  await driver.switchToFrame(null)
  return driver
}
export async function parentContext(driver: Driver): Promise<Driver> {
  await driver.switchToParentFrame()
  return driver
}
export async function childContext(driver: Driver, element: Element): Promise<Driver> {
  await driver.switchToFrame(element)
  return driver
}
export async function findElement(driver: Driver, selector: Selector, parent?: Element): Promise<Element | null> {
  const element = parent
    ? await driver.findElementFromElement(extractElementId(parent), selector.using, selector.value)
    : await driver.findElement(selector.using, selector.value)
  return isElement(element) ? element : null
}
export async function findElements(driver: Driver, selector: Selector, parent?: Element): Promise<Element[]> {
  return parent
    ? await driver.findElementsFromElement(extractElementId(parent), selector.using, selector.value)
    : await driver.findElements(selector.using, selector.value)
}
export async function getWindowSize(driver: Driver): Promise<{width: number; height: number}> {
  if (utils.types.isFunction(driver.getWindowRect)) {
    const rect = await driver.getWindowRect()
    return {width: rect.width, height: rect.height}
  } else if (utils.types.isFunction(driver._getWindowSize)) {
    return (await driver._getWindowSize()) as {width: number; height: number}
  }
}
export async function setWindowSize(driver: Driver, size: {width: number; height: number}) {
  if (utils.types.isFunction(driver.setWindowRect)) {
    await driver.setWindowRect(0, 0, size.width, size.height)
  } else {
    await driver.setWindowPosition(0, 0)
    await driver._setWindowSize(size.width, size.height)
  }
}
export async function getCookies(driver: Driver, context?: boolean): Promise<types.Cookie[]> {
  if (context) return driver.getAllCookies()

  const response = await driver.sendCommandAndGetResult('Network.getAllCookies', {})
  const cookies = response.cookies

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
export async function getCapabilities(browser: Driver): Promise<Record<string, any>> {
  return browser.getSession?.() ?? browser.capabilities
}
export async function getDriverInfo(driver: Driver): Promise<any> {
  return {sessionId: driver.sessionId}
}
export async function getTitle(driver: Driver): Promise<string> {
  return driver.getTitle()
}
export async function getUrl(driver: Driver): Promise<string> {
  return driver.getUrl()
}
export async function visit(driver: Driver, url: string): Promise<void> {
  await driver.navigateTo(url)
}
export async function takeScreenshot(driver: Driver): Promise<string> {
  return driver.takeScreenshot()
}
export async function click(driver: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await driver.elementClick(extractElementId(element))
}
export async function type(driver: Driver, element: Element, value: string): Promise<void> {
  await driver.elementSendKeys(extractElementId(element), value)
}

// #endregion

// #region NATIVE COMMANDS

export async function getBarsHeight(browser: Driver): Promise<{statusBarHeight: number; navigationBarHeight: number}> {
  const {statusBar, navigationBar}: any = await browser.getSystemBars()
  return {
    statusBarHeight: statusBar.visible ? statusBar.height : 0,
    navigationBarHeight: navigationBar.visible ? navigationBar.height : 0,
  }
}
export async function getOrientation(browser: Driver): Promise<'portrait' | 'landscape'> {
  const orientation = await browser.getOrientation()
  return orientation.toLowerCase() as 'portrait' | 'landscape'
}
export async function getElementRegion(driver: Driver, element: Element): Promise<types.Region> {
  return driver.getElementRect(extractElementId(element))
}
export async function getElementAttribute(driver: Driver, element: Element, attr: string): Promise<string> {
  return driver.getElementAttribute(extractElementId(element), attr)
}
export async function getElementText(driver: Driver, element: Element): Promise<string> {
  return driver.getElementText(extractElementId(element))
}
export async function performAction(driver: Driver, steps: any[]): Promise<void> {
  return driver.touchPerform(steps.map(({action, ...options}) => ({action, options})))
}

// #endregion

// #region TESTING

const browserOptionsNames: Record<string, string> = {
  chrome: 'goog:chromeOptions',
  firefox: 'moz:firefoxOptions',
}
export async function build(env: any): Promise<[Driver, () => Promise<void>]> {
  const parseEnv = require('@applitools/test-utils/src/parse-env')
  const {
    browser = '',
    capabilities,
    url,
    proxy,
    configurable = true,
    args = [],
    headless,
    logLevel = 'silent',
  } = parseEnv(env)

  const options: any = {
    capabilities: {browserName: browser, ...capabilities},
    logLevel,
  }
  options.protocol = url.protocol ? url.protocol.replace(/:$/, '') : undefined
  options.hostname = url.hostname
  if (url.port) options.port = Number(url.port)
  else if (options.protocol === 'http') options.port = 80
  else if (options.protocol === 'https') options.port = 443
  options.path = url.pathname
  if (configurable) {
    const browserOptionsName = browserOptionsNames[browser || options.capabilities.browserName]
    if (browserOptionsName) {
      const browserOptions = options.capabilities[browserOptionsName] || {}
      browserOptions.args = [...(browserOptions.args || []), ...args]
      if (headless) browserOptions.args.push('headless')
      options.capabilities[browserOptionsName] = browserOptions
    }
  }
  if (proxy) {
    options.capabilities.proxy = {
      proxyType: 'manual',
      httpProxy: proxy.http || proxy.server,
      sslProxy: proxy.https || proxy.server,
      ftpProxy: proxy.ftp,
      noProxy: proxy.bypass.join(','),
    }
  }
  const driver = await WebDriver.newSession(options)
  return [driver, () => driver.deleteSession()]
}

// #endregion
