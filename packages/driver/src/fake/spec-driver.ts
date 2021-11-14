import type {Size, DriverInfo} from '@applitools/types'
import * as utils from '@applitools/utils'

export type Driver = any
export type Element = any
export type Selector = string | {using: string; value: string}

export function isDriver(driver: any): driver is Driver {
  return driver && driver.constructor.name === 'MockDriver'
}
export function isElement(element: any): element is Element {
  return utils.types.has(element, 'id')
}
export function isSelector(selector: any): selector is Selector {
  return utils.types.isString(selector) || utils.types.has(selector, ['using', 'value'])
}
export function transformSelector(selector: Selector | {selector: Selector}): Selector {
  return utils.types.has(selector, 'selector') ? selector.selector : selector
}
export function isStaleElementError(): boolean {
  return false
}
export async function isEqualElements(_driver: Driver, element1: Element, element2: Element): Promise<boolean> {
  return element1.id === element2.id
}
export async function executeScript(driver: Driver, script: ((arg: any) => any) | string, arg: any): Promise<any> {
  return driver.executeScript(script, [arg])
}
export async function findElement(driver: Driver, selector: Selector, parent?: Element): Promise<Element> {
  return driver.findElement(selector, parent)
}
export async function findElements(driver: Driver, selector: Selector, parent?: Element): Promise<Element[]> {
  return driver.findElements(selector, parent)
}
export async function mainContext(driver: Driver): Promise<Driver> {
  return driver.switchToFrame(null)
}
export async function parentContext(driver: Driver): Promise<Driver> {
  return driver.switchToParentFrame()
}
export async function childContext(driver: Driver, element: Element): Promise<Driver> {
  return driver.switchToFrame(element)
}
export async function takeScreenshot(driver: Driver): Promise<Buffer | string> {
  return driver.takeScreenshot()
}
export async function getDriverInfo(driver: Driver): Promise<DriverInfo> {
  return driver.info
}
export async function getWindowSize(driver: Driver): Promise<Size> {
  const rect = await driver.getWindowRect()
  return rect
}
export async function setWindowSize(driver: Driver, size: Size): Promise<void> {
  await driver.setWindowRect(size)
}
export async function getUrl(driver: Driver): Promise<string> {
  if (this._isNative) return null
  return driver.getUrl()
}
export async function getTitle(driver: Driver): Promise<string> {
  if (this._isNative) return null
  return driver.getTitle()
}
export async function visit(driver: Driver, url: string): Promise<void> {
  await driver.visit(url)
}
