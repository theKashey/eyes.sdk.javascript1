import type * as types from '@applitools/types'
import type * as Selenium from 'selenium-webdriver'
import * as utils from '@applitools/utils'

export type Driver = Selenium.WebDriver
export type Element = Selenium.WebElement
export type Selector = Selenium.By | Selenium.ByHash

export type TransformedDriver = {sessionId: string; serverUrl: string; capabilities: Record<string, any>}
export type TransformedElement = {elementId: string}
export type TransformedSelector = types.Selector<never>

type CommonSelector = string | {selector: Selector | string; type?: string}

const byHash = ['className', 'css', 'id', 'linkText', 'name', 'partialLinkText', 'tagName', 'xpath'] as const

export function isDriver(driver: any): driver is Driver {
  return utils.types.instanceOf(driver, 'WebDriver')
}
export function isElement(element: any): element is Element {
  return utils.types.instanceOf(element, 'WebElement')
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return utils.types.has(selector, ['using', 'value']) || Object.keys(selector).some(key => byHash.includes(key as any))
}

export async function transformDriver(driver: Driver): Promise<TransformedDriver> {
  const session = await driver.getSession()
  const capabilities = await driver.getCapabilities()
  return {
    serverUrl: 'http://localhost:4444/wd/hub',
    // serverUrl: 'https://ondemand.saucelabs.com/wd/hub',
    sessionId: session.getId(),
    capabilities: Array.from(capabilities.keys()).reduce((caps, key) => {
      caps[key] = capabilities.get(key)
      return caps
    }, {} as Record<string, any>),
  }
}

export async function transformElement(element: Element): Promise<TransformedElement> {
  return {elementId: await element.getId()}
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

// #region TESTING

export async function executeScript(driver: Driver, script: ((arg: any) => any) | string, arg: any): Promise<any> {
  return driver.executeScript(script, arg)
}
export async function mainContext(driver: Driver): Promise<Driver> {
  await driver.switchTo().defaultContent()
  return driver
}
export async function parentContext(driver: Driver): Promise<Driver> {
  if (process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3') {
    const cmd = require('selenium-webdriver/lib/command')
    await (driver as any).schedule(new cmd.Command(cmd.Name.SWITCH_TO_PARENT_FRAME))
    return driver
  }
  await driver.switchTo().parentFrame()
  return driver
}
export async function childContext(driver: Driver, element: Element): Promise<Driver> {
  await driver.switchTo().frame(element)
  return driver
}
export async function findElement(driver: Driver, selector: Selector): Promise<Element> {
  try {
    return await driver.findElement(selector)
  } catch (err) {
    if (err.name === 'NoSuchElementError') return null
    else throw err
  }
}
export async function findElements(driver: Driver, selector: Selector): Promise<Element[]> {
  return driver.findElements(selector)
}

export async function visit(driver: Driver, url: string): Promise<void> {
  await driver.get(url)
}
export async function click(driver: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await driver.findElement(element)
  await element.click()
}
export async function hover(driver: Driver, element: Element | Selector) {
  if (isSelector(element)) element = await driver.findElement(element)
  await driver.actions().move({origin: element}).perform()
}
export async function type(driver: Driver, element: Element | Selector, keys: string): Promise<void> {
  if (isSelector(element)) element = await driver.findElement(element)
  await element.sendKeys(keys)
}
export async function scrollIntoView(driver: Driver, element: Element | Selector, align = false): Promise<void> {
  if (isSelector(element)) element = await driver.findElement(element)
  await driver.executeScript('arguments[0].scrollIntoView(arguments[1])', element, align)
}
export async function waitUntilDisplayed(driver: Driver, selector: Selector, timeout: number): Promise<void> {
  const {until} = require('selenium-webdriver')
  const element = await driver.findElement(selector)
  await driver.wait(until.elementIsVisible(element), timeout)
}

const browserOptionsNames: Record<string, string> = {
  chrome: 'goog:chromeOptions',
  firefox: 'moz:firefoxOptions',
}
export async function build(env: any): Promise<[Driver, () => Promise<void>]> {
  const {Builder} = require('selenium-webdriver')
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
  } = parseEnv({...env, legacy: env.legacy ?? process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3'})
  const desiredCapabilities = {browserName: browser, ...capabilities}
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
  const driver = await builder.build()
  return [driver, () => driver.quit()]
}

// #endregion
