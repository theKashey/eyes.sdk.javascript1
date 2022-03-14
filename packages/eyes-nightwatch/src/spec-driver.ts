import type {Size, Cookie, DriverInfo} from '@applitools/types'
import type * as Nightwatch from 'nightwatch'
import * as utils from '@applitools/utils'

export type Driver = Nightwatch.NightwatchAPI & {__applitoolsBrand?: never}
export type Element = (
  | {ELEMENT: string}
  | {'element-6066-11e4-a52e-4f735466cecf': string}
  | Nightwatch.NightwatchTypedCallbackResult<{ELEMENT: string} | {'element-6066-11e4-a52e-4f735466cecf': string}>
) & {__applitoolsBrand?: never}
export type Selector = {locateStrategy: Nightwatch.LocateStrategy; selector: string} & {__applitoolsBrand?: never}

type ShadowRoot = {'shadow-6066-11e4-a52e-4f735466cecf': string}
type CommonSelector = string | {selector: Selector | string; type?: string}

// #region HELPERS

const LEGACY_ELEMENT_ID = 'ELEMENT'
const SHADOW_ROOT_ID = 'shadow-6066-11e4-a52e-4f735466cecf'
const ELEMENT_ID = 'element-6066-11e4-a52e-4f735466cecf'

function extractElementId(element: Element | ShadowRoot): string {
  if (utils.types.has(element, ELEMENT_ID)) return element[ELEMENT_ID]
  else if (utils.types.has(element, LEGACY_ELEMENT_ID)) return element[LEGACY_ELEMENT_ID]
  else if (utils.types.has(element, SHADOW_ROOT_ID)) return element[SHADOW_ROOT_ID]
}
function call<
  TCommand extends keyof {
    [TCommand in keyof Driver as Driver[TCommand] extends (...args: [...infer TArgs, (...args: any[]) => any]) => any
      ? TCommand
      : never]: void
  },
  TResult = Driver[TCommand] extends (
    ...args: [...infer TArgs, (result: Nightwatch.NightwatchCallbackResult<infer TResult>) => any]
  ) => any
    ? TResult
    : void
>(driver: Driver, command: TCommand, ...args: any[]): Promise<TResult> {
  return new Promise<TResult>((resolve, reject) => {
    const promise = (driver[command] as any)(...args, (result: Nightwatch.NightwatchCallbackResult<TResult>) => {
      if (!('value' in result) && !(result as any).error) resolve(result as any)
      else if (!result.status && !(result as any).error) resolve(result.value as TResult)
      else reject(result.value || (result as any).error)
    })
    if (promise instanceof Promise) promise.then(resolve, reject)
  })
}

// #endregion

// #region UTILITY

export function isDriver(driver: any): driver is Driver {
  return utils.types.instanceOf(driver, 'NightwatchAPI')
}
export function isElement(element: any): element is Element {
  if (!element || element.error) return false
  return Boolean(extractElementId(element.value || element))
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return utils.types.has(selector, ['locateStrategy', 'selector'])
}
export function transformDriver(driver: Driver): Driver {
  return new Proxy(driver, {
    get(target, key) {
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
  if (utils.types.isString(selector)) {
    return {locateStrategy: 'css selector', selector}
  } else if (utils.types.has(selector, 'selector') && !utils.types.has(selector, 'locateStrategy')) {
    if (!utils.types.isString(selector.selector)) return selector.selector
    if (!utils.types.has(selector, 'type')) return {locateStrategy: 'css selector', selector: selector.selector}
    if (selector.type === 'css') return {locateStrategy: 'css selector', selector: selector.selector}
    else return {locateStrategy: selector.type as Nightwatch.LocateStrategy, selector: selector.selector}
  }
  return selector
}
export function isStaleElementError(err: any): boolean {
  if (!err) return false
  const error = err.originalError || err
  const message = error && error.message
  return message && (message.includes('stale element reference') || message.includes('is stale'))
}
export async function isEqualElements(_driver: Driver, element1: Element, element2: Element): Promise<boolean> {
  if (!element1 || !element2) return false
  const elementId1 = extractElementId(element1)
  const elementId2 = extractElementId(element2)
  return elementId1 === elementId2
}

// #endregion

// #region COMMANDS

export async function executeScript(driver: Driver, script: ((arg: any) => any) | string, arg: any): Promise<any> {
  return call(driver, 'execute', script, [arg])
}
export async function mainContext(driver: Driver): Promise<Driver> {
  await call(driver, 'frame')
  return driver
}
export async function parentContext(driver: Driver): Promise<Driver> {
  await call(driver, 'frameParent')
  return driver
}
export async function childContext(driver: Driver, element: Element): Promise<Driver> {
  await call(driver, 'frame', element)
  return driver
}
export async function findElement(driver: Driver, selector: Selector, parent?: Element): Promise<Element> {
  try {
    return parent
      ? await call(driver, 'elementIdElement', extractElementId(parent), selector.locateStrategy, selector.selector)
      : await call(driver, 'element', selector.locateStrategy, selector.selector)
  } catch {
    return null
  }
}
export async function findElements(driver: Driver, selector: Selector, parent?: Element): Promise<Element[]> {
  return parent
    ? await call(driver, 'elementIdElements', extractElementId(parent), selector.locateStrategy, selector.selector)
    : await call(driver, 'elements', selector.locateStrategy, selector.selector)
}
export async function getWindowSize(driver: Driver): Promise<Size> {
  // NOTE:
  // https://github.com/nightwatchjs/nightwatch/blob/fd4aff1e2cc3e691a82e61c7e550fb088ee47d5a/lib/transport/jsonwire/actions.js#L165-L167
  // getWindowRect is implemented on JWP drivers even though it won't work
  // So we need to catch and retry a window size command that will work on JWP
  try {
    const rect = (await call(driver, 'getWindowRect' as any)) as any
    return {width: rect.width, height: rect.height}
  } catch {
    return call(driver, 'getWindowSize' as 'windowSize')
  }
}
export async function setWindowSize(driver: Driver, size: Size): Promise<void> {
  // NOTE:
  // Same deal as with getWindowSize. If running on JWP, need to catch and retry
  // with a different command.
  try {
    await call(driver, 'setWindowRect' as any, size)
  } catch {
    await call(driver, 'setWindowPosition' as 'windowPosition', 0, 0)
    await call(driver, 'setWindowSize' as 'windowSize', size.width, size.height)
  }
}
export async function getCookies(driver: Driver, context?: boolean): Promise<Cookie[]> {
  if (context) return call(driver, 'getCookies')
  return []
}
export async function getCapabilities(driver: Driver): Promise<Record<string, any>> {
  try {
    return await call(driver, 'session')
  } catch {
    return driver.options.desiredCapabilities
  }
}
export async function getDriverInfo(driver: Driver): Promise<DriverInfo> {
  return {sessionId: driver.sessionId, features: {allCookies: false}}
}
export async function getTitle(driver: Driver): Promise<string> {
  return call(driver, 'title')
}
export async function getUrl(driver: Driver): Promise<string> {
  return call(driver, 'url')
}
export async function visit(driver: Driver, url: string): Promise<void> {
  return call(driver, 'url', url)
}
export async function takeScreenshot(driver: Driver): Promise<string> {
  // TODO: ask forum about how to track error handling
  return call(driver, 'screenshot', false)
}
export async function click(driver: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await call(driver, 'elementIdClick', extractElementId(element))
}
export async function hover(driver: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await call(driver, 'moveTo', extractElementId(element))
}
export async function type(driver: Driver, element: Element | Selector, keys: string): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await driver.elementIdValue(extractElementId(element), keys)
}
export async function scrollIntoView(driver: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  // NOTE: moveTo will scroll the element into view, but it also moves the mouse
  // cursor to the element. This might have unintended side effects.
  // Will need to wait and see, since there's no simple alternative.
  await call(driver, 'moveTo', extractElementId(element), 0, 0)
}
export async function waitUntilDisplayed(driver: Driver, selector: Selector, timeout: number): Promise<void> {
  await call(driver, 'waitForElementVisible' as any, selector.locateStrategy, selector.selector, timeout)
}

// #endregion

// #region TESTING

const browserOptionsNames: Record<string, string> = {
  chrome: 'goog:chromeOptions',
  firefox: 'moz:firefoxOptions',
}
export async function build(env: any): Promise<[Driver, () => Promise<void>]> {
  // config prep
  const parseEnv = require('@applitools/test-utils/src/parse-env')
  const {browser = '', capabilities, url, configurable = true, args = [], headless} = parseEnv({
    ...env,
    legacy: true,
  })
  const desiredCapabilities = {browserName: browser, ...capabilities}
  if (configurable) {
    const browserOptionsName = browserOptionsNames[browser || desiredCapabilities.browserName]
    if (browserOptionsName) {
      const browserOptions = desiredCapabilities[browserOptionsName] || {}
      browserOptions.args = [...(browserOptions.args || []), ...args]
      if (headless) browserOptions.args.push('headless')
      if (browser === 'firefox') {
        desiredCapabilities.alwaysMatch = {[browserOptionsName]: browserOptions}
      } else {
        desiredCapabilities[browserOptionsName] = browserOptions
      }
      if (browser !== 'firefox' && !browserOptions.mobileEmulation) browserOptions.w3c = false
    }
  }
  // needed for mobile native to work in newer versions of nightwatch
  if (desiredCapabilities.browserName === '') desiredCapabilities.browserName = null

  // building
  const Nightwatch = require('nightwatch')
  const Settings = require('nightwatch/lib/settings/settings')
  const settings = Settings.parse(
    {},
    {
      test_settings: {
        default: {
          output: false,
          webdriver: {
            host: !url.host.includes('localhost') ? url.host : undefined,
            port: url.port || 4444,
            default_path_prefix: url.pathname,
          },
          desiredCapabilities,
        },
      },
    },
    {},
    'default',
  )
  const client = Nightwatch.client(settings)
  client.isES6AsyncTestcase = true
  await client.createSession()
  return [client.api, () => client.session.close()]
}

// #endregion
