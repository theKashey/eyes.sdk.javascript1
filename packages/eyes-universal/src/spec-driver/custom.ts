import type * as types from '@applitools/types'
import * as utils from '@applitools/utils'

export type Driver = types.Ref
export type Context = types.Ref
export type Element = types.Ref
export type Selector = types.SpecSelector<types.Ref>

type SpecDriver = Omit<types.SpecDriver<Driver, Context, Element, Selector>, 'transformDriver' | 'transformElement'>

export function makeSpec(options: {
  socket: types.ServerSocket<Driver, Context, Element, Selector>
  commands: (keyof SpecDriver)[]
}): types.SpecDriver<Driver, Context, Element, Selector> {
  const {socket, commands} = options

  const spec: Required<SpecDriver> = {
    // #region UTILITY
    isDriver(driver: any): driver is Driver {
      return utils.types.has(driver, 'applitools-ref-id')
    },
    isContext(context: any): context is Context {
      return utils.types.has(context, 'applitools-ref-id')
    },
    isElement(element: any): element is Element {
      return utils.types.has(element, 'applitools-ref-id')
    },
    isSelector(selector: any): selector is Selector {
      return (
        utils.types.isString(selector) ||
        utils.types.has(selector, ['type', 'selector']) ||
        utils.types.has(selector, 'applitools-ref-id')
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
    async findElement(context: Context, selector: Selector): Promise<Element | null> {
      return socket.request('Driver.findElement', {context, selector})
    },
    async findElements(context: Context, selector: Selector): Promise<Element[]> {
      return socket.request('Driver.findElements', {context, selector})
    },
    async takeScreenshot(driver: Driver): Promise<string> {
      return socket.request('Driver.takeScreenshot', {driver})
    },
    async getDriverInfo(driver: Driver): Promise<any> {
      return socket.request('Driver.getDriverInfo', {driver})
    },
    async getOrientation(driver: Driver): Promise<'portrait' | 'landscape'> {
      return socket.request('Driver.getOrientation', {driver})
    },
    async getTitle(driver) {
      return socket.request('Driver.getTitle', {driver})
    },
    async getUrl(driver) {
      return socket.request('Driver.getUrl', {driver})
    },
    async getElementRect(driver: Driver, element: Element): Promise<types.Size> {
      return socket.request('Driver.getElementRect', {driver, element})
    },
    async getWindowSize(driver: Driver): Promise<types.Size> {
      return socket.request('Driver.getWindowSize', {driver})
    },
    async setWindowSize(driver: Driver, size: types.Size): Promise<void> {
      return socket.request('Driver.setWindowSize', {driver, size})
    },
    async getViewportSize(driver: Driver): Promise<types.Size> {
      return socket.request('Driver.getViewportSize', {driver})
    },
    async setViewportSize(driver: Driver, size: types.Size): Promise<void> {
      return socket.request('Driver.setViewportSize', {driver, size})
    },
    async visit(driver: Driver, url: string): Promise<void> {
      return socket.request('Driver.visit', {driver, url})
    },
    // #endregion
  }

  return commands.reduce((commands, name) => {
    return Object.assign(commands, {[name]: spec[name]})
  }, {} as types.SpecDriver<Driver, Context, Element, Selector>)
}
