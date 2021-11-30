import type {Size, Region, Cookie, DriverInfo} from '@applitools/types'
import * as utils from '@applitools/utils'
import {By} from './legacy'

export type Driver = WebdriverIO.Client<void> & {__applitoolsBrand?: never}
export type Element = (
  | WebdriverIO.Element
  | {ELEMENT: string}
  | {'element-6066-11e4-a52e-4f735466cecf': string}
  | WebdriverIO.RawResult<WebdriverIO.Element | {ELEMENT: string} | {'element-6066-11e4-a52e-4f735466cecf': string}>
) & {__applitoolsBrand?: never}
export type Selector = (string | By) & {__applitoolsBrand?: never}

type ShadowRoot = {'shadow-6066-11e4-a52e-4f735466cecf': string}
type CommonSelector = string | {selector: Selector | string; type?: string}

// #region HELPERS

const LEGACY_ELEMENT_ID = 'ELEMENT'
const SHADOW_ROOT_ID = 'shadow-6066-11e4-a52e-4f735466cecf'
const ELEMENT_ID = 'element-6066-11e4-a52e-4f735466cecf'

function extractElementId(element: Element | ShadowRoot): string {
  if (utils.types.has(element, 'elementId')) return element.elementId as string
  else if (utils.types.has(element, ELEMENT_ID)) return element[ELEMENT_ID]
  else if (utils.types.has(element, LEGACY_ELEMENT_ID)) return element[LEGACY_ELEMENT_ID]
  else if (utils.types.has(element, SHADOW_ROOT_ID)) return element[SHADOW_ROOT_ID]
}

// #endregion

// #region UTILITY

export function isDriver(browser: any): browser is Driver {
  if (!browser) return false
  return Boolean(browser.getPrototype && browser.desiredCapabilities && browser.requestHandler)
}
export function isElement(element: any): element is Element {
  if (!element) return false
  return element.value
    ? Boolean(element.value[ELEMENT_ID] || element.value[LEGACY_ELEMENT_ID])
    : Boolean(element[ELEMENT_ID] || element[LEGACY_ELEMENT_ID])
}
export function isSelector(selector: any): selector is Selector {
  return utils.types.isString(selector) || selector instanceof By
}
export function transformDriver(browser: Driver): Driver {
  return new Proxy(browser, {
    get: (target, key) => {
      if (key === 'then') return undefined
      return Reflect.get(target, key)
    },
  })
}
export function transformElement(element: Element): Element {
  const elementId = extractElementId(utils.types.has(element, 'value') ? element.value : element)
  return {[ELEMENT_ID]: elementId, [LEGACY_ELEMENT_ID]: elementId}
}
export function transformSelector(selector: Selector | CommonSelector): Selector {
  if (utils.types.has(selector, 'selector')) {
    if (!utils.types.has(selector, 'type')) return selector.selector
    if (selector.type === 'css') return `css selector:${selector.selector}`
    else return `${selector.type}:${selector.selector}`
  }
  return selector
}
export function extractSelector(element: Element): Selector {
  return utils.types.has(element, 'selector') ? (element.selector as string) : undefined
}
export function isStaleElementError(error: any, selector: Selector): boolean {
  if (!error) return false
  const errOrResult = error.originalError || error
  return errOrResult instanceof Error
    ? (errOrResult as any).seleniumStack && (errOrResult as any).seleniumStack.type === 'StaleElementReference'
    : errOrResult.value && errOrResult.selector && errOrResult.selector === selector
}
export async function isEqualElements(_browser: Driver, element1: Element, element2: Element): Promise<boolean> {
  if (!element1 || !element2) return false
  const elementId1 = extractElementId(element1)
  const elementId2 = extractElementId(element2)
  return elementId1 === elementId2
}

// #endregion

// #region COMMANDS

export async function executeScript(browser: Driver, script: ((arg: any) => any) | string, arg: any): Promise<any> {
  const {value} = await browser.execute(script, arg)
  return value
}
export async function mainContext(browser: Driver): Promise<Driver> {
  await browser.frame(null)
  return browser
}
export async function parentContext(browser: Driver): Promise<Driver> {
  await browser.frameParent()
  return browser
}
export async function childContext(browser: Driver, element: Element): Promise<Driver> {
  await browser.frame(element)
  return browser
}
export async function findElement(browser: Driver, selector: Selector, parent?: Element): Promise<Element> {
  selector = selector instanceof By ? selector.toString() : selector
  const {value} = parent
    ? await browser.elementIdElement(extractElementId(parent), selector)
    : await browser.element(selector)
  return value
}
export async function findElements(browser: Driver, selector: Selector, parent?: Element): Promise<Element[]> {
  selector = selector instanceof By ? selector.toString() : selector
  const {value} = parent
    ? await browser.elementIdElements(extractElementId(parent), selector)
    : await browser.elements(selector)
  return value
}
export async function getWindowSize(browser: Driver): Promise<Size> {
  const {value: size} = (await browser.windowHandleSize()) as {value: Size}
  return {width: size.width, height: size.height}
}
export async function setWindowSize(browser: Driver, size: Size): Promise<void> {
  await browser.windowHandlePosition({x: 0, y: 0})
  await browser.windowHandleSize(size)
}
export async function getCookies(browser: Driver, context?: boolean): Promise<Cookie[]> {
  if (context) return browser.getCookie() as Cookie[]

  const result = await (browser as any).requestHandler.create(
    {method: 'POST', path: '/session/:sessionId/chromium/send_command_and_get_result'},
    {cmd: 'Network.getAllCookies', params: {}},
  )

  return result.value.cookies.map((cookie: any) => {
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
export async function getDriverInfo(browser: Driver): Promise<DriverInfo> {
  return {sessionId: (browser as any).requestHandler.sessionID || browser.sessionId}
}
export async function getCapabilities(browser: Driver): Promise<Record<string, any>> {
  return browser.session?.().then(({value}) => value) ?? browser.desiredCapabilities
}
export async function getTitle(browser: Driver): Promise<string> {
  return browser.getTitle()
}
export async function getUrl(browser: Driver): Promise<string> {
  return browser.getUrl()
}
export async function visit(browser: Driver, url: string): Promise<void> {
  await browser.url(url)
}
export async function takeScreenshot(driver: Driver): Promise<Buffer> {
  return driver.saveScreenshot()
}
export async function click(browser: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await findElement(browser, element)
  await browser.elementIdClick(extractElementId(element))
}
export async function hover(
  browser: Driver,
  element: Element | Selector,
  offset?: {x: number; y: number},
): Promise<void> {
  if (isSelector(element)) element = await findElement(browser, element)
  await browser.moveTo(extractElementId(element), offset?.x, offset?.y)
}
export async function type(browser: Driver, element: Element | Selector, keys: string): Promise<void> {
  if (isSelector(element)) element = await findElement(browser, element)
  else browser.elementIdValue(extractElementId(element), keys)
}
export async function scrollIntoView(browser: Driver, element: Element | Selector, align = false): Promise<void> {
  if (isSelector(element)) element = await findElement(browser, element)
  await browser.execute('arguments[0].scrollIntoView(arguments[1])', element, align)
}
export async function waitUntilDisplayed(browser: Driver, selector: Selector, timeout: number): Promise<void> {
  await browser.waitForVisible(selector as string, timeout)
}

// #endregion

// #region MOBILE COMMANDS

export async function getBarsHeight(browser: Driver): Promise<{statusBarHeight: number; navigationBarHeight: number}> {
  const {statusBar, navigationBar} = await (browser as any).requestHandler
    .create({method: 'GET', path: '/session/:sessionId/appium/device/system_bars'})
    .then(({value}: any) => value)
  return {
    statusBarHeight: statusBar.visible ? statusBar.height : 0,
    navigationBarHeight: navigationBar.visible ? navigationBar.height : 0,
  }
}
export async function getOrientation(browser: Driver): Promise<'portrait' | 'landscape'> {
  const orientation = (await browser.getOrientation()) as unknown as string
  return orientation.toLowerCase() as 'portrait' | 'landscape'
}
export async function getElementRegion(browser: Driver, element: Element): Promise<Region> {
  const {value} = await browser.elementIdRect(extractElementId(element))
  return value
}
export async function getElementAttribute(browser: Driver, element: Element, attr: string): Promise<string> {
  const result = await browser.elementIdAttribute(extractElementId(element), attr)
  return result.value
}
export async function getElementText(browser: Driver, element: Element): Promise<string> {
  const result = browser.elementIdText(extractElementId(element))
  return result.value
}
export async function performAction(browser: Driver, steps: any[]): Promise<void> {
  await browser.touchPerform(steps.map(({action, ...options}) => ({action, options})))
}

// #endregion

// #region TESTING

const browserOptionsNames: Record<string, string> = {
  chrome: 'goog:chromeOptions',
  firefox: 'moz:firefoxOptions',
}
export async function build(env: any): Promise<[Driver, () => Promise<void>]> {
  const webdriverio = require('webdriverio')
  const chromedriver = require('chromedriver')
  const parseEnv = require('@applitools/test-utils/src/parse-env')
  const {
    browser = '',
    capabilities,
    url,
    attach,
    proxy,
    configurable = true,
    args = [],
    headless,
    logLevel = 'silent',
  } = parseEnv({...env, legacy: true})

  const options = {
    desiredCapabilities: {browserName: browser, ...capabilities},
    logLevel,
    protocol: url.protocol ? url.protocol.replace(/:$/, '') : undefined,
    host: url.hostname,
    port: url.port,
    path: url.pathname,
  }
  if (configurable) {
    if (browser === 'chrome' && attach) {
      await chromedriver.start(['--port=9515'], true)
      options.protocol = 'http'
      options.host = 'localhost'
      options.port = '9515'
      options.path = '/'
    }
    const browserOptionsName = browserOptionsNames[browser || options.desiredCapabilities.browserName]
    if (browserOptionsName) {
      const browserOptions = options.desiredCapabilities[browserOptionsName] || {}
      browserOptions.args = [...(browserOptions.args || []), ...args]
      if (browser !== 'firefox') browserOptions.w3c = false
      if (headless) browserOptions.args.push('headless')
      if (attach) {
        browserOptions.debuggerAddress = attach === true ? 'localhost:9222' : attach
      }
      options.desiredCapabilities[browserOptionsName] = browserOptions
    }
  }
  if (proxy) {
    options.desiredCapabilities.proxy = {
      proxyType: 'manual',
      httpProxy: proxy.http || proxy.server,
      sslProxy: proxy.https || proxy.server,
      ftpProxy: proxy.ftp,
      noProxy: proxy.bypass.join(','),
    }
  }
  const driver = webdriverio.remote(options)
  await driver.init()

  return [driver, () => driver.end().then(() => chromedriver.stop())]
}

// #endregion
