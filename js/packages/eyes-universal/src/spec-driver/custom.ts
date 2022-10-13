import type {Region, Size} from '@applitools/utils'
import type {Ref, ServerSocket, UniversalSpecDriver} from '../types'
import {
  type SpecDriver,
  type Selector as DriverSelector,
  type Cookie,
  type DriverInfo,
  type WaitOptions,
} from '@applitools/driver'
import * as utils from '@applitools/utils'

export type Driver = Ref
export type Context = Ref
export type Element = Ref
export type Selector = DriverSelector<Ref>

export function makeSpec(options: {
  socket: ServerSocket<Driver, Context, Element, Selector>
  commands: (keyof UniversalSpecDriver<Driver, Context, Element, Selector>)[]
}): SpecDriver<Driver, Context, Element, Selector> {
  const {socket, commands} = options

  const spec: Required<
    Omit<
      SpecDriver<Driver, Context, Element, Selector>,
      'transformDriver' | 'transformElement' | 'transformSelector' | 'untransformSelector'
    >
  > = {
    // #region UTILITY
    isDriver(driver: any): driver is Driver {
      return utils.types.has(driver, 'applitools-ref-id')
    },
    isContext(context: any): context is Context {
      return utils.types.has(context, 'applitools-ref-id')
    },
    isElement(element: any): element is Element {
      return utils.types.has(element, ['applitools-ref-id', 'type']) && element.type === 'element'
    },
    isSelector(selector: any): selector is Selector {
      return (
        (utils.types.has(selector, ['applitools-ref-id', 'type']) && selector.type === 'selector') ||
        utils.types.isString(selector) ||
        (utils.types.isPlainObject(selector) &&
          utils.types.has(selector, 'selector') &&
          (utils.types.isString(selector.selector) || utils.types.has(selector, 'applitools-ref-id')))
      )
    },
    extractContext(element: Driver & {context: Context}): Context {
      return element.context
    },
    extractSelector(element: Element & {selector: Selector}): Selector {
      return element.selector
    },
    isStaleElementError(error: any): boolean {
      return error?.isStaleElementError
    },
    async isEqualElements(context: Context, element1: Element, element2: Element): Promise<boolean> {
      return socket.request('Driver.isEqualElements', {context, element1, element2})
    },
    // #endregion

    // #region COMMANDS
    async mainContext(context: Context): Promise<Context> {
      return socket.request('Driver.mainContext', {context})
    },
    async parentContext(context: Context): Promise<Context> {
      return socket.request('Driver.parentContext', {context})
    },
    async childContext(context: Context, element: Element): Promise<Context> {
      return socket.request('Driver.childContext', {context, element})
    },
    async executeScript(context: Context, script: (arg?: any) => any | string, arg?: any): Promise<any> {
      return socket.request('Driver.executeScript', {context, script: script.toString(), arg})
    },
    async findElement(context: Context, selector: Selector, parent?: Element): Promise<Element | null> {
      return socket.request('Driver.findElement', {context, selector, parent})
    },
    async findElements(context: Context, selector: Selector, parent?: Element): Promise<Element[]> {
      return socket.request('Driver.findElements', {context, selector, parent})
    },
    async getWindowSize(driver: Driver): Promise<Size> {
      return socket.request('Driver.getWindowSize', {driver})
    },
    async setWindowSize(driver: Driver, size: Size): Promise<void> {
      return socket.request('Driver.setWindowSize', {driver, size})
    },
    async getViewportSize(driver: Driver): Promise<Size> {
      return socket.request('Driver.getViewportSize', {driver})
    },
    async setViewportSize(driver: Driver, size: Size): Promise<void> {
      return socket.request('Driver.setViewportSize', {driver, size})
    },
    async getCookies(driver: Driver, context?: boolean): Promise<Cookie[]> {
      return socket.request('Driver.getCookies', {driver, context})
    },
    async getCapabilities(driver: Driver): Promise<Record<string, any>> {
      return socket.request('Driver.getCapabilities', {driver})
    },
    async getDriverInfo(driver: Driver): Promise<DriverInfo> {
      return socket.request('Driver.getDriverInfo', {driver})
    },
    async getTitle(driver: Driver): Promise<string> {
      return socket.request('Driver.getTitle', {driver})
    },
    async getUrl(driver: Driver): Promise<string> {
      return socket.request('Driver.getUrl', {driver})
    },
    async takeScreenshot(driver: Driver): Promise<string> {
      return socket.request('Driver.takeScreenshot', {driver})
    },
    async click(context: Context, element: Element | Selector): Promise<void> {
      return socket.request('Driver.click', {context, element})
    },
    async type(context: Context, element: Element, value: string): Promise<void> {
      return socket.request('Driver.type', {context, element, value})
    },
    async visit(driver: Driver, url: string): Promise<void> {
      return socket.request('Driver.visit', {driver, url})
    },
    async waitForSelector(
      _context: Context,
      _selector: Selector,
      _parent?: Element,
      _options?: WaitOptions,
    ): Promise<Element | null> {
      // do nothing
      return
    },
    // #endregion

    // #region NATIVE COMMANDS
    async getSystemBars(driver: Driver): Promise<{
      statusBar: {visible: boolean; x: number; y: number; height: number; width: number}
      navigationBar: {visible: boolean; x: number; y: number; height: number; width: number}
    }> {
      return socket.request('Driver.getSystemBars', {driver})
    },
    async getOrientation(
      driver: Driver,
    ): Promise<'portrait' | 'landscape' | 'portrait-secondary' | 'landscape-secondary'> {
      return socket.request('Driver.getOrientation', {driver})
    },
    async setOrientation(driver: Driver, orientation: 'portrait' | 'landscape'): Promise<void> {
      return socket.request('Driver.setOrientation', {driver, orientation})
    },
    async getElementRegion(driver: Driver, element: Element): Promise<Region> {
      return socket.request('Driver.getElementRegion', {driver, element})
    },
    async getElementAttribute(driver: Driver, element: Element, attr: string): Promise<string> {
      return socket.request('Driver.getElementAttribute', {driver, element, attr})
    },
    async getElementText(driver: Driver, element: Element): Promise<string> {
      return socket.request('Driver.getElementText', {driver, element})
    },
    async performAction(driver: Driver, steps: any[]): Promise<void> {
      return socket.request('Driver.performAction', {driver, steps})
    },
    /* eslint-disable @typescript-eslint/no-empty-function */
    async getCurrentWorld(driver: Driver): Promise<string> {
      return socket.request('Driver.getCurrentWorld', {driver})
    },
    async getWorlds(driver: Driver): Promise<string[]> {
      return socket.request('Driver.getWorlds', {driver})
    },
    async switchWorld(driver: Driver, name: string): Promise<void> {
      return socket.request('Driver.switchWorld', {driver, name})
    },
    /* eslint-enable @typescript-eslint/no-empty-function*/

    // #endregion
  }

  return commands.reduce((commands, name) => {
    return Object.assign(commands, {[name]: spec[name]})
  }, {} as SpecDriver<Driver, Context, Element, Selector>)
}
