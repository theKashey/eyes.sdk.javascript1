import type {Size, Region, Cookie, DriverInfo, WaitOptions} from '@applitools/types'
import * as Selenium from 'selenium-webdriver'
import * as utils from '@applitools/utils'

export type Driver = Selenium.WebDriver & {__applitoolsBrand?: never}
export type Element = Selenium.WebElement & {__applitoolsBrand?: never}
export type Selector = (Selenium.Locator | {using: string; value: string}) & {__applitoolsBrand?: never}

type ShadowRoot = {'shadow-6066-11e4-a52e-4f735466cecf': string}
type CommonSelector = string | {selector: Selector | string; type?: string}

// #region HELPERS

const byHash = ['className', 'css', 'id', 'js', 'linkText', 'name', 'partialLinkText', 'tagName', 'xpath']

function extractElementId(element: Element | ShadowRoot): Promise<string> | string {
  return isElement(element) ? (element.getId() as Promise<string>) : element['shadow-6066-11e4-a52e-4f735466cecf']
}
function transformShadowRoot(driver: Driver, shadowRoot: ShadowRoot | Element): Element {
  return utils.types.has(shadowRoot, 'shadow-6066-11e4-a52e-4f735466cecf')
    ? new Selenium.WebElement(driver, shadowRoot['shadow-6066-11e4-a52e-4f735466cecf'])
    : shadowRoot
}

// #endregion

// #region UTILITY

export function isDriver(driver: any): driver is Driver {
  return utils.types.instanceOf(driver, 'WebDriver')
}
export function isElement(element: any): element is Element {
  return utils.types.instanceOf(element, 'WebElement')
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return utils.types.has(selector, ['using', 'value']) || byHash.includes(Object.keys(selector)[0])
}
export function transformDriver(driver: Driver): Driver {
  driver.getExecutor().defineCommand('getSessionDetails', 'GET', '/session/:sessionId')
  driver.getExecutor().defineCommand('getOrientation', 'GET', '/session/:sessionId/orientation')
  driver.getExecutor().defineCommand('getSystemBars', 'GET', '/session/:sessionId/appium/device/system_bars')
  driver.getExecutor().defineCommand('getWindowSize', 'GET', '/session/:sessionId/window/current/size')
  driver.getExecutor().defineCommand('setWindowSize', 'POST', '/session/:sessionId/window/current/size')
  driver.getExecutor().defineCommand('setWindowPosition', 'POST', '/session/:sessionId/window/current/position')
  driver.getExecutor().defineCommand('performTouch', 'POST', '/session/:sessionId/touch/perform')
  driver.getExecutor().defineCommand('executeCdp', 'POST', '/session/:sessionId/chromium/send_command_and_get_result')

  if (process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3') {
    driver.getExecutor().defineCommand('switchToParentFrame', 'POST', '/session/:sessionId/frame/parent')
  }
  return driver
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
  if (process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3') {
    const {Command} = require('selenium-webdriver/lib/command')
    await (driver as any).schedule(new Command('switchToParentFrame'))
    return driver
  }
  await driver.switchTo().parentFrame()
  return driver
}
export async function childContext(driver: Driver, element: Element): Promise<Driver> {
  await driver.switchTo().frame(element)
  return driver
}

export async function findElement(driver: Driver, selector: Selector, parent?: Element): Promise<Element | null> {
  try {
    const root = parent ? transformShadowRoot(driver, parent) : driver
    return await root.findElement(selector)
  } catch (err) {
    if (err.name === 'NoSuchElementError') return null
    else throw err
  }
}
export async function findElements(driver: Driver, selector: Selector, parent?: Element): Promise<Element[]> {
  const root = parent ? transformShadowRoot(driver, parent) : driver
  return root.findElements(selector)
}
export async function waitForSelector(
  driver: Driver,
  selector: Selector,
  _parent?: Element,
  options?: WaitOptions,
): Promise<Element | null> {
  if ((options?.state ?? 'exists') === 'exist') {
    return driver.wait(Selenium.until.elementLocated(selector), options?.timeout)
  } else if (options?.state === 'visible') {
    const element = await findElement(driver, selector)
    return driver.wait(Selenium.until.elementIsVisible(element), options?.timeout)
  }
}
export async function getWindowSize(driver: Driver): Promise<Size> {
  try {
    const rect = await driver.manage().window().getRect()
    return {width: rect.width, height: rect.height}
  } catch {
    const {Command} = require('selenium-webdriver/lib/command')
    const getWindowSizeCommand = new Command('getWindowSize')
    const size: any = driver.manage().window().getSize
      ? await driver.manage().window().getSize()
      : await driver.execute(getWindowSizeCommand)
    return {width: size.width, height: size.height}
  }
}
export async function setWindowSize(driver: Driver, size: Size) {
  try {
    await driver.manage().window().setRect({x: 0, y: 0, width: size.width, height: size.height})
  } catch {
    const {Command} = require('selenium-webdriver/lib/command')
    const setWindowPositionCommand = new Command('setWindowPosition').setParameters({x: 0, y: 0})
    if (driver.manage().window().setPosition) await driver.manage().window().setPosition(0, 0)
    else await driver.execute(setWindowPositionCommand)
    const setWindowSizeCommand = new Command('setWindowSize').setParameters({...size})
    if (driver.manage().window().setSize) await driver.manage().window().setSize(size.width, size.height)
    else await driver.execute(setWindowSizeCommand)
  }
}
export async function getCookies(driver: Driver, context?: boolean): Promise<Cookie[]> {
  if (context) return driver.manage().getCookies()

  let cookies
  if (utils.types.isFunction(driver, 'sendAndGetDevToolsCommand')) {
    const response = await driver.sendAndGetDevToolsCommand('Network.getAllCookies')
    cookies = response.cookies
  } else {
    const {Command} = require('selenium-webdriver/lib/command')
    const executeCdpCommand = new Command('executeCdp')
      .setParameter('cmd', 'Network.getAllCookies')
      .setParameter('params', {})
    const response =
      process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3'
        ? await (driver as any).schedule(executeCdpCommand)
        : await (driver as any).execute(executeCdpCommand)
    cookies = response.cookies
  }

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
export async function getDriverInfo(driver: Driver): Promise<DriverInfo> {
  const session = await driver.getSession()
  return {sessionId: session.getId()}
}
export async function getCapabilities(driver: Driver): Promise<Record<string, any>> {
  try {
    const {Command} = require('selenium-webdriver/lib/command')
    const getSessionDetailsCommand = new Command('getSessionDetails')
    return process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3'
      ? await (driver as any).schedule(getSessionDetailsCommand)
      : await driver.execute(getSessionDetailsCommand)
  } catch {
    const capabilities = await driver.getCapabilities()
    return Array.from(capabilities.keys()).reduce((obj, key) => Object.assign(obj, {key: capabilities.get(key)}), {})
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
  await element.click()
}
export async function hover(driver: Driver, element: Element | Selector) {
  if (isSelector(element)) element = await findElement(driver, element)
  if (process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3') {
    const {ActionSequence} = require('selenium-webdriver')
    const action = new ActionSequence(driver)
    await action.mouseMove(element).perform()
  } else {
    await driver.actions().move({origin: element}).perform()
  }
}
export async function type(driver: Driver, element: Element | Selector, keys: string): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await element.sendKeys(keys)
}
export async function scrollIntoView(driver: Driver, element: Element | Selector, align = false): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await driver.executeScript('arguments[0].scrollIntoView(arguments[1])', element, align)
}
export async function waitUntilDisplayed(driver: Driver, selector: Selector, timeout: number): Promise<void> {
  const element = await findElement(driver, selector)
  await driver.wait(Selenium.until.elementIsVisible(element), timeout)
}

// #endregion

// #region MOBILE COMMANDS
export async function getBarsHeight(driver: Driver): Promise<{statusBarHeight: number; navigationBarHeight: number}> {
  const {Command} = require('selenium-webdriver/lib/command')
  const getSystemBarsCommand = new Command('getSystemBars')
  const {statusBar, navigationBar} =
    process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3'
      ? await (driver as any).schedule(getSystemBarsCommand)
      : await driver.execute(getSystemBarsCommand)
  return {
    statusBarHeight: statusBar.visible ? statusBar.height : 0,
    navigationBarHeight: navigationBar.visible ? navigationBar.height : 0,
  }
}
export async function getOrientation(driver: Driver): Promise<'portrait' | 'landscape'> {
  const {Command} = require('selenium-webdriver/lib/command')
  const getOrientationCommand = new Command('getOrientation')
  const orientation =
    process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3'
      ? await (driver as any).schedule(getOrientationCommand)
      : await driver.execute(getOrientationCommand)
  return orientation.toLowerCase() as 'portrait' | 'landscape'
}
export async function getElementRegion(_driver: Driver, element: Element): Promise<Region> {
  if (utils.types.isFunction(element.getRect)) {
    return element.getRect()
  } else {
    const {x, y} = await element.getLocation()
    const {width, height} = await element.getSize()
    return {x, y, width, height}
  }
}
export async function getElementAttribute(_driver: Driver, element: Element, attr: string): Promise<string> {
  return element.getAttribute(attr)
}
export async function getElementText(_driver: Driver, element: Element): Promise<string> {
  return element.getText()
}
export async function performAction(driver: Driver, steps: any[]): Promise<void> {
  const {Command} = require('selenium-webdriver/lib/command')
  const performTouchCommand = new Command('performTouch').setParameters({
    actions: steps.map(({action, ...options}) => ({action, options})),
  })
  if (process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3') {
    await (driver as any).schedule(performTouchCommand)
  } else {
    await driver.execute(performTouchCommand)
  }
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
    browser,
    capabilities,
    url,
    attach,
    proxy,
    configurable = true,
    appium = false,
    args = [],
    headless,
  } = parseEnv({...env, legacy: env.legacy ?? process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3'})
  const desiredCapabilities = {...capabilities}
  if (configurable) {
    const browserOptionsName = browserOptionsNames[browser || desiredCapabilities.browserName]
    if (browserOptionsName) {
      const browserOptions = desiredCapabilities[browserOptionsName] || {}
      browserOptions.args = [...(browserOptions.args || []), ...args]
      if (headless) browserOptions.args.push('headless')
      if (attach) {
        browserOptions.debuggerAddress = attach === true ? 'localhost:9222' : attach
        if (browser !== 'firefox') browserOptions.w3c = false
      }
      desiredCapabilities[browserOptionsName] = browserOptions
    }
  }
  if (appium && browser === 'chrome') {
    desiredCapabilities['appium:chromeOptions'] = {w3c: false}
  }
  if (browser === 'chrome' && process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3') {
    desiredCapabilities['goog:chromeOptions'] = {w3c: false}
  }
  const builder = new Selenium.Builder().withCapabilities(desiredCapabilities)
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
  const driver = await builder.build()
  return [driver, () => driver.quit()]
}

// #endregion
