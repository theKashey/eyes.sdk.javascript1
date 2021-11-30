import type {Size, Cookie, DriverInfo} from '@applitools/types'
import * as Protractor from 'protractor'
import * as utils from '@applitools/utils'

export type Driver = Protractor.ProtractorBrowser
export type Element = Protractor.WebElement | Protractor.ElementFinder
export type Selector = Protractor.Locator | {using: string; value: string}

type ShadowRoot = {'shadow-6066-11e4-a52e-4f735466cecf': string}
type CommonSelector = string | {selector: Selector | string; type?: string}

// #region HELPERS

const byHash = ['className', 'css', 'id', 'js', 'linkText', 'name', 'partialLinkText', 'tagName', 'xpath']

function extractElementId(element: Element | ShadowRoot): Promise<string> | string {
  return isElement(element) ? (element.getId() as Promise<string>) : element['shadow-6066-11e4-a52e-4f735466cecf']
}
function transformShadowRoot(driver: Driver, shadowRoot: ShadowRoot | Element): Element {
  return isElement(shadowRoot)
    ? shadowRoot
    : new Protractor.WebElement(driver, shadowRoot['shadow-6066-11e4-a52e-4f735466cecf'])
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
export function transformDriver(driver: Driver): Driver {
  driver.getExecutor().defineCommand('getSessionDetails', 'GET', '/session/:sessionId')
  return driver
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
    const root = parent ? Protractor.ElementFinder.fromWebElement_(driver, transformShadowRoot(driver, parent)) : driver
    return await root.element(selector).getWebElement()
  } catch (err) {
    if (err.name === 'NoSuchElementError') return null
    else throw err
  }
}
export async function findElements(driver: Driver, selector: Selector, parent?: Element): Promise<Element[]> {
  const root = parent
    ? Protractor.ElementFinder.fromWebElement_(driver, transformShadowRoot(driver, parent))
    : driver.element
  return root.all(selector).getWebElements()
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
export async function getDriverInfo(driver: Driver): Promise<DriverInfo> {
  const session = await driver.getSession()
  return {sessionId: session.getId()}
}
export async function getCapabilities(driver: Driver): Promise<Record<string, any>> {
  try {
    const getSessionDetailsCommand = new Protractor.Command('getSessionDetails')
    return await driver.schedule(getSessionDetailsCommand, '')
  } catch {
    const capabilities = ((await driver.getCapabilities()) as any) as Map<string, any>
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
  const element = await findElement(driver, selector)
  await driver.wait(Protractor.until.elementIsVisible(element), timeout)
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
  const builder = new Protractor.Builder().withCapabilities(desiredCapabilities)
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
  const runner = new Protractor.Runner({
    seleniumWebDriver: builder.build(),
    logLevel: logLevel.toUpperCase(),
    allScriptsTimeout: 60000,
    getPageTimeout: 10000,
  })
  const driver = await runner.createBrowser(undefined).ready
  driver.by = driver.constructor.By
  driver.waitForAngularEnabled(false)
  return [driver, () => driver.quit()]
}

// #endregion
