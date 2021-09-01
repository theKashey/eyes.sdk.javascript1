import type * as types from '@applitools/types'
import type * as WD from 'webdriver'
import * as utils from '@applitools/utils'
import WebDriver from 'webdriver'

export type Driver = WD.Client
export type Element = {'element-6066-11e4-a52e-4f735466cecf': string}
export type Selector = types.SpecSelector<{using: string; value: string}>

// #region HELPERS

function extractElementId(element: Element): string {
  return (element as any).elementId ?? element['element-6066-11e4-a52e-4f735466cecf']
}

function transformSelector(selector: Selector): [string, string] {
  if (utils.types.isString(selector)) {
    return ['css selector', selector]
  } else if (utils.types.has(selector, ['type', 'selector'])) {
    if (selector.type === 'css') return ['css selector', selector.selector]
    else if (selector.type === 'xpath') return ['xpath', selector.selector]
    else return [selector.type, selector.selector]
  } else {
    return [selector.using, selector.value]
  }
}

// #endregion

// #region UTILITY

export function isDriver(driver: any): driver is Driver {
  if (!driver) return false
  return utils.types.has(driver, ['sessionId', 'serverUrl']) || utils.types.instanceOf(driver, 'Browser')
}
export function isElement(element: any): element is Element {
  if (!element) return false
  return Boolean(extractElementId(element))
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return (
    utils.types.isString(selector) ||
    utils.types.has(selector, ['type', 'selector']) ||
    utils.types.has(selector, ['using', 'value'])
  )
}
export function transformDriver(driver: {
  sessionId: string
  serverUrl: string
  capabilities: Record<string, any>
}): Driver {
  const url = new URL(driver.serverUrl)
  const options: WD.AttachOptions = {
    sessionId: driver.sessionId,
    protocol: url.protocol ? url.protocol.replace(/:$/, '') : undefined,
    hostname: url.hostname,
    port: Number(url.port) || undefined,
    path: url.pathname,
    capabilities: driver.capabilities,
    logLevel: 'silent',
  }
  if (!options.port) {
    if (options.protocol === 'http') options.port = 80
    if (options.protocol === 'https') options.port = 443
  }
  return WebDriver.attachToSession(options)
}
export function transformElement(element: {elementId: string} | Element): Element {
  if (utils.types.has(element, 'elementId')) {
    return {'element-6066-11e4-a52e-4f735466cecf': element.elementId}
  }
  return element
}
export function isStaleElementError(error: any): boolean {
  if (!error) return false
  const errOrResult = error.originalError || error
  return errOrResult instanceof Error && errOrResult.name === 'stale element reference'
}

// #endregion

// #region COMMANDS

export async function isEqualElements(driver: Driver, element1: Element, element2: Element): Promise<boolean> {
  if (!element1 || !element2) return false
  try {
    return await driver.executeScript('return arguments[0] === arguments[1]', [element1, element2])
  } catch (err) {
    return false
  }
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
export async function findElement(driver: Driver, selector: Selector): Promise<Element | null> {
  const element = await driver.findElement(...transformSelector(selector))
  return !utils.types.has(element, 'error') ? element : null
}
export async function findElements(driver: Driver, selector: Selector): Promise<Element[]> {
  return driver.findElements(...transformSelector(selector))
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
export async function getDriverInfo(driver: Driver): Promise<any> {
  const capabilities = driver.capabilities as any
  const info: any = {
    sessionId: driver.sessionId,
    isMobile: driver.isMobile,
    isNative: driver.isMobile && !capabilities.browserName,
    deviceName: capabilities.desired?.deviceName ?? capabilities.deviceName,
    platformName: capabilities.platformName ?? capabilities.platform ?? capabilities.desired?.platformName,
    platformVersion: capabilities.platformVersion,
    browserName: capabilities.browserName ?? capabilities.desired.browserName,
    browserVersion: capabilities.browserVersion ?? capabilities.version,
    pixelRatio: capabilities.pixelRatio,
  }

  if (info.isNative) {
    const capabilities = utils.types.has(driver.capabilities, ['pixelRatio', 'viewportRect', 'statBarHeight'])
      ? driver.capabilities
      : await driver.getSession()

    info.pixelRatio = capabilities.pixelRatio

    try {
      const {statusBar, navigationBar} = (await driver.getSystemBars()) as any
      info.statusBarHeight = statusBar.visible ? statusBar.height : 0
      info.navigationBarHeight = navigationBar.visible ? navigationBar.height : 0
    } catch (err) {
      info.statusBarHeight = capabilities.statBarHeight ?? capabilities.viewportRect?.top ?? 0
      info.navigationBarHeight = 0
    }
  }

  return info
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

// #endregion

// #region NATIVE COMMANDS

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
