import type {Size, Region, Cookie} from '@applitools/types'
import * as utils from '@applitools/utils'

export type Driver = Applitools.WebdriverIO.Browser & {__applitoolsBrand?: never}
export type Element = (
  | Applitools.WebdriverIO.Element
  | {ELEMENT: string}
  | {'element-6066-11e4-a52e-4f735466cecf': string}
) & {__applitoolsBrand?: never}
export type Selector = (Applitools.WebdriverIO.Selector | {using: string; value: string}) & {__applitoolsBrand?: never}

type ShadowRoot = {'shadow-6066-11e4-a52e-4f735466cecf': string}
type CommonSelector = string | {selector: Selector | string; type?: string}

// #region HELPERS

const LEGACY_ELEMENT_ID = 'ELEMENT'
const ELEMENT_ID = 'element-6066-11e4-a52e-4f735466cecf'

function extractElementId(element: Element): string {
  if (utils.types.has(element, 'elementId')) return element.elementId as string
  else if (utils.types.has(element, ELEMENT_ID)) return element[ELEMENT_ID] as string
  else if (utils.types.has(element, LEGACY_ELEMENT_ID)) return element[LEGACY_ELEMENT_ID] as string
}
function transformShadowRoot(shadowRoot: ShadowRoot | Element): Element {
  return isElement(shadowRoot) ? shadowRoot : {[ELEMENT_ID]: shadowRoot['shadow-6066-11e4-a52e-4f735466cecf']}
}
function transformArgument(arg: any): [any?, ...Element[]] {
  if (!arg) return []
  const elements: Element[] = []
  const argWithElementMarkers = transform(arg)

  return [argWithElementMarkers, ...elements]

  function transform(arg: any): any {
    if (isElement(arg)) {
      elements.push(arg)
      return {isElement: true}
    } else if (utils.types.isArray(arg)) {
      return arg.map(transform)
    } else if (utils.types.isObject(arg)) {
      return Object.entries(arg).reduce((object, [key, value]) => {
        return Object.assign(object, {[key]: transform(value)})
      }, {})
    } else {
      return arg
    }
  }
}
// NOTE:
// A few things to note:
//  - this function runs inside of the browser process
//  - evaluations in Puppeteer accept multiple arguments (not just one like in Playwright)
//  - an element reference (a.k.a. an ElementHandle) can only be sent as its
//    own argument. To account for this, we use a wrapper function to receive all
//    of the arguments in a serialized structure, deserialize them, and call the script,
//    and pass the arguments as originally intended
function scriptRunner(script: string, arg: any, ...elements: Element[]) {
  const func = new Function(script.startsWith('function') ? `return (${script}).apply(null, arguments)` : script)
  return func(transform(arg))

  function transform(arg: any): any {
    if (!arg) {
      return arg
    } else if (arg.isElement) {
      return elements.shift()
    } else if (Array.isArray(arg)) {
      return arg.map(transform)
    } else if (typeof arg === 'object') {
      return Object.entries(arg).reduce((object, [key, value]) => {
        return Object.assign(object, {[key]: transform(value)})
      }, {})
    } else {
      return arg
    }
  }
}

// #endregion

// #region UTILITY

export function isDriver(browser: any): browser is Driver {
  if (!browser) return false
  return browser.constructor.name === 'Browser'
}
export function isElement(element: any): element is Element {
  if (!element) return false
  return Boolean(element.elementId || element[ELEMENT_ID] || element[LEGACY_ELEMENT_ID])
}
export function isSelector(selector: any): selector is Selector {
  return (
    utils.types.isString(selector) || utils.types.isFunction(selector) || utils.types.has(selector, ['using', 'value'])
  )
}
export function transformDriver(driver: Driver): Driver {
  const command = require('webdriver/build/command').default
  const additionalCommands = {
    _getWindowSize: command('GET', '/session/:sessionId/window/current/size', {
      command: '_getWindowSize',
      parameters: [],
    }),
    _setWindowSize: command('POST', '/session/:sessionId/window/current/size', {
      command: '_setWindowSize',
      parameters: [
        {name: 'width', type: 'number', required: true},
        {name: 'height', type: 'number', required: true},
      ],
    }),
    setWindowPosition: command('POST', '/session/:sessionId/window/current/position', {
      command: 'setWindowPosition',
      parameters: [
        {name: 'x', type: 'number', required: true},
        {name: 'y', type: 'number', required: true},
      ],
    }),
  }
  Object.entries(additionalCommands).forEach(([name, command]) => driver.addCommand(name, command))
  return driver
}
export function transformElement(element: Element): Element {
  const elementId = extractElementId(element)
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
  return (element as any).selector
}
export function isStaleElementError(error: any): boolean {
  if (!error) return false
  const errOrResult = error.originalError || error
  return errOrResult instanceof Error && errOrResult.name === 'stale element reference'
}
export async function isEqualElements(_browser: Driver, element1: Element, element2: Element): Promise<boolean> {
  if (!element1 || !element2) return false
  const elementId1 = extractElementId(element1)
  const elementId2 = extractElementId(element2)
  return elementId1 === elementId2
}

// #endregion

// #region COMMANDS

export async function executeScript(browser: Driver, script: ((arg: any) => any) | string, arg?: any): Promise<any> {
  if (browser.isDevTools) {
    script = utils.types.isString(script) ? script : script.toString()
    return browser.execute(scriptRunner, script, ...transformArgument(arg))
  } else {
    return browser.execute(script, arg)
  }
}
export async function mainContext(browser: Driver): Promise<Driver> {
  await browser.switchToFrame(null)
  return browser
}
export async function parentContext(browser: Driver): Promise<Driver> {
  await browser.switchToParentFrame()
  return browser
}
export async function childContext(browser: Driver, element: Element): Promise<Driver> {
  await browser.switchToFrame(element)
  return browser
}
export async function findElement(
  browser: Driver,
  selector: Selector,
  parent?: Element,
): Promise<Applitools.WebdriverIO.Element> {
  selector = utils.types.has(selector, ['using', 'value']) ? `${selector.using}:${selector.value}` : selector
  const root = parent ? await browser.$(transformShadowRoot(parent) as any) : browser
  try {
    const element = await root.$(selector)
    return !utils.types.has(element, 'error') ? element : null
  } catch (error) {
    if (
      /element could not be located/i.test(error.message) ||
      /cannot locate an element/i.test(error.message) ||
      /wasn\'t found/i.test(error.message)
    ) {
      return null
    }
    throw error
  }
}
export async function findElements(
  browser: Driver,
  selector: Selector,
  parent?: Element,
): Promise<Applitools.WebdriverIO.Element[]> {
  selector = utils.types.has(selector, ['using', 'value']) ? `${selector.using}:${selector.value}` : selector
  const root = parent ? await browser.$(transformShadowRoot(parent) as any) : browser
  const elements = await root.$$(selector)
  return Array.from(elements)
}
export async function getWindowSize(browser: Driver): Promise<Size> {
  try {
    const rect = await browser.getWindowRect()
    return {width: rect.width, height: rect.height}
  } catch {
    return browser._getWindowSize() as Promise<Size>
  }
}
export async function setWindowSize(browser: Driver, size: Size): Promise<void> {
  try {
    await browser.setWindowRect(0, 0, size.width, size.height)
  } catch {
    await browser.setWindowPosition(0, 0)
    await browser._setWindowSize(size.width, size.height)
  }
}
export async function getCookies(browser: Driver, context?: boolean): Promise<Cookie[]> {
  if (context) return browser.getCookies()
  let cookies
  if (browser.isDevTools) {
    const puppeteer = await browser.getPuppeteer()
    const [page] = await puppeteer.pages()
    const cdpSession = await page.target().createCDPSession()
    const response: any = await cdpSession.send('Network.getAllCookies')
    cookies = response.cookies
  } else {
    const response: any = await browser.sendCommandAndGetResult('Network.getAllCookies', {})
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
export async function getCapabilities(browser: Driver): Promise<Record<string, any>> {
  try {
    return (await browser.getSession?.()) ?? browser.capabilities
  } catch (error) {
    if (/cannot call non W3C standard command/i.test(error.message)) return browser.capabilities
    throw error
  }
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
export async function takeScreenshot(browser: Driver): Promise<string | Buffer> {
  if (browser.isDevTools) {
    const puppeteer = await browser.getPuppeteer()
    const [page] = await puppeteer.pages()
    const scr = await (page as any)._client.send('Page.captureScreenshot')
    return scr.data
  }
  return browser.takeScreenshot()
}
export async function click(browser: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await findElement(browser, element)
  const extendedElement = await browser.$(element as any)
  await extendedElement.click()
}
export async function type(browser: Driver, element: Element | Selector, keys: string): Promise<void> {
  if (isSelector(element)) element = await findElement(browser, element)
  const extendedElement = await browser.$(element as any)
  await extendedElement.setValue(keys)
}
export async function hover(browser: Driver, element: Element | Selector): Promise<any> {
  if (isSelector(element)) element = await findElement(browser, element)

  if (browser.isDevTools) {
    const {x, y, width, height} = await browser.execute((element: any) => {
      const rect = element.getBoundingClientRect()
      return {x: rect.x, y: rect.y, width: rect.width, height: rect.height}
    }, element)
    const puppeteer = await browser.getPuppeteer()
    const [page] = await puppeteer.pages()
    await page.mouse.move(x + width / 2, y + height / 2)
  } else {
    const extendedElement = await browser.$(element as any)
    await extendedElement.moveTo()
  }
}
export async function scrollIntoView(browser: Driver, element: Element | Selector, align = false): Promise<void> {
  if (isSelector(element)) element = await findElement(browser, element)
  const extendedElement = await browser.$(element as any)
  await extendedElement.scrollIntoView(align)
}
export async function waitUntilDisplayed(browser: Driver, selector: Selector, timeout: number): Promise<void> {
  const element = await findElement(browser, selector)
  if (process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION === '5') {
    // @ts-ignore
    await element.waitForDisplayed(timeout)
  } else {
    // @ts-ignore
    await element.waitForDisplayed({timeout})
  }
}

// #endregion

// #region MOBILE COMMANDS

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
export async function getElementRegion(browser: Driver, element: Element): Promise<Region> {
  const extendedElement = await browser.$(element as any)
  if (utils.types.isFunction(extendedElement, 'getRect')) {
    return extendedElement.getRect()
  } else {
    const region = {x: 0, y: 0, width: 0, height: 0}
    if (utils.types.isFunction(extendedElement.getLocation)) {
      const location = await extendedElement.getLocation()
      region.x = location.x
      region.y = location.y
    }
    if (utils.types.isFunction(extendedElement.getSize)) {
      const size = await extendedElement.getSize()
      region.width = size.width
      region.height = size.height
    }
    return region
  }
}
export async function getElementAttribute(browser: Driver, element: Element, attr: string): Promise<string> {
  return browser.getElementAttribute(extractElementId(element), attr)
}
export async function getElementText(browser: Driver, element: Element): Promise<string> {
  const extendedElement = await browser.$(element as any)
  return extendedElement.getText()
}
export async function performAction(browser: Driver, steps: any[]): Promise<void> {
  return browser.touchAction(steps as any)
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
    protocol,
    browser = '',
    capabilities,
    url,
    attach,
    proxy,
    configurable = true,
    args = [],
    headless,
    logLevel = 'silent',
  } = parseEnv(env, process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL)

  const options: any = {
    capabilities: {browserName: browser, ...capabilities},
    logLevel,
  }
  if (browser === 'chrome' && protocol === 'cdp') {
    options.automationProtocol = 'devtools'
    options.capabilities[browserOptionsNames.chrome] = {args}
    options.capabilities['wdio:devtoolsOptions'] = {
      headless,
      ignoreDefaultArgs: ['--hide-scrollbars'],
    }
  } else if (protocol === 'wd') {
    options.automationProtocol = 'webdriver'
    options.protocol = url.protocol ? url.protocol.replace(/:$/, '') : undefined
    options.hostname = url.hostname
    if (url.port) options.port = Number(url.port)
    else if (options.protocol === 'http') options.port = 80
    else if (options.protocol === 'https') options.port = 443
    options.path = url.pathname
    if (configurable) {
      if (browser === 'chrome' && attach) {
        await chromedriver.start(['--port=9515'], true)
        options.protocol = 'http'
        options.hostname = 'localhost'
        options.port = 9515
        options.path = '/'
      }
      const browserOptionsName = browserOptionsNames[browser || options.capabilities.browserName]
      if (browserOptionsName) {
        const browserOptions = options.capabilities[browserOptionsName] || {}
        browserOptions.args = [...(browserOptions.args || []), ...args]
        if (headless) browserOptions.args.push('headless')
        if (attach) {
          browserOptions.debuggerAddress = attach === true ? 'localhost:9222' : attach
          if (browser !== 'firefox') browserOptions.w3c = false
        }
        options.capabilities[browserOptionsName] = browserOptions
      }
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
  const driver = await webdriverio.remote(options)
  return [driver, () => driver.deleteSession().then(() => chromedriver.stop())]
}

// #endregion
