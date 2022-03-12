import {Size, Region} from './data'

export type DriverInfo = {
  sessionId?: string
  browserName?: string
  browserVersion?: string
  platformName?: string
  platformVersion?: string
  deviceName?: string
  userAgent?: string
  viewportSize?: Size
  orientation?: 'portrait' | 'landscape'
  pixelRatio?: number
  viewportScale?: number
  safeArea?: Region
  statusBarHeight?: number
  navigationBarHeight?: number
  isW3C?: boolean
  isMobile?: boolean
  isNative?: boolean
  isAndroid?: boolean
  isIOS?: boolean
  features?: {
    shadowSelector?: boolean
    allCookies?: boolean
  }
}

export type Cookie = {
  name: string
  value: string
  domain?: string
  path?: string
  expiry?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

export type WaitOptions = {
  state?: 'exist' | 'visible'
  interval?: number
  timeout?: number
}

export type Selector<TSelector = never> =
  | TSelector
  | string
  | {selector: TSelector | string; type?: string; shadow?: Selector<TSelector>; frame?: Selector<TSelector>}

export interface SpecDriver<TDriver, TContext, TElement, TSelector> {
  // #region UTILITY
  isDriver(driver: any): driver is TDriver
  isContext?(context: any): context is TContext
  isElement(element: any): element is TElement
  isSelector(selector: any): selector is TSelector
  transformDriver?(driver: any): TDriver
  transformElement?(element: any): TElement
  transformSelector?(selector: Selector<TSelector>): TSelector
  extractContext?(element: TDriver | TContext): TContext
  extractSelector?(element: TElement): TSelector
  isStaleElementError(error: any, selector?: TSelector): boolean
  isEqualElements?(context: TContext, element1: TElement, element2: TElement): Promise<boolean>
  // #endregion

  // #region COMMANDS
  mainContext(context: TContext): Promise<TContext>
  parentContext?(context: TContext): Promise<TContext>
  childContext(context: TContext, element: TElement): Promise<TContext>
  executeScript(context: TContext, script: ((arg?: any) => any) | string, arg?: any): Promise<any>
  findElement(context: TContext, selector: TSelector, parent?: TElement): Promise<TElement | null>
  findElements(context: TContext, selector: TSelector, parent?: TElement): Promise<TElement[]>
  waitForSelector?(
    context: TContext,
    selector: TSelector,
    parent?: TElement,
    options?: WaitOptions,
  ): Promise<TElement | null>
  setWindowSize?(driver: TDriver, size: Size): Promise<void>
  getWindowSize?(driver: TDriver): Promise<Size>
  setViewportSize?(driver: TDriver, size: Size): Promise<void>
  getViewportSize?(driver: TDriver): Promise<Size>
  getCookies?(driver: TDriver | TContext, context?: boolean): Promise<Cookie[]>
  getDriverInfo?(driver: TDriver): Promise<DriverInfo>
  getCapabilities?(driver: TDriver): Promise<Record<string, any>>
  getTitle(driver: TDriver): Promise<string>
  getUrl(driver: TDriver): Promise<string>
  takeScreenshot(driver: TDriver): Promise<Buffer | string>
  click?(context: TContext, element: TElement | TSelector): Promise<void>
  type?(context: TContext, element: TElement, value: string): Promise<void>
  visit?(driver: TDriver, url: string): Promise<void>
  // #endregion

  // #region MOBILE COMMANDS
  getOrientation?(driver: TDriver): Promise<'portrait' | 'landscape'>
  getBarsHeight?(driver: TDriver): Promise<{statusBarHeight: number; navigationBarHeight: number}>
  getElementRegion?(driver: TDriver, element: TElement): Promise<Region>
  getElementAttribute?(driver: TDriver, element: TElement, attr: string): Promise<string>
  getElementText?(driver: TDriver, element: TElement): Promise<string>
  performAction?(driver: TDriver, steps: any[]): Promise<void>
  // #endregion
}

// Idealy would be transform SpecDriver type to the type with single object argument
// but typescript doesn't have a possiblity to convert named tuples to object types at the moment
export interface UniversalSpecDriver<TDriver, TContext, TElement, TSelector> {
  // #region UTILITY
  isEqualElements?(options: {context: TContext; element1: TElement; element2: TElement}): Promise<boolean>
  // #endregion

  // #region COMMANDS
  mainContext(options: {context: TContext}): Promise<TContext>
  parentContext?(options: {context: TContext}): Promise<TContext>
  childContext(options: {context: TContext; element: TElement}): Promise<TContext>
  executeScript(options: {context: TContext; script: string; arg?: any}): Promise<any>
  findElement(options: {context: TContext; selector: TSelector; parent?: TElement}): Promise<TElement | null>
  findElements(options: {context: TContext; selector: TSelector; parent?: TElement}): Promise<TElement[]>
  setWindowSize?(options: {driver: TDriver; size: Size}): Promise<void>
  getWindowSize?(options: {driver: TDriver}): Promise<Size>
  setViewportSize?(options: {driver: TDriver; size: Size}): Promise<void>
  getViewportSize?(options: {driver: TDriver}): Promise<Size>
  getCookies?(options: {driver: TDriver | TContext; context?: boolean}): Promise<Cookie[]>
  getDriverInfo?(options: {driver: TDriver}): Promise<DriverInfo>
  getCapabilities?(options: {driver: TDriver}): Promise<Record<string, any>>
  getTitle(options: {driver: TDriver}): Promise<string>
  getUrl(options: {driver: TDriver}): Promise<string>
  takeScreenshot(options: {driver: TDriver}): Promise<string>
  click?(options: {context: TContext; element: TElement | TSelector}): Promise<void>
  type?(options: {context: TContext; element: TElement; value: string}): Promise<void>
  visit?(options: {driver: TDriver; url: string}): Promise<void>
  // #endregion

  // #region MOBILE COMMANDS
  getOrientation?(options: {driver: TDriver}): Promise<'portrait' | 'landscape'>
  getBarsHeight?(options: {driver: TDriver}): Promise<{statusBarHeight: number; navigationBarHeight: number}>
  getElementRegion?(options: {driver: TDriver; element: TElement}): Promise<Region>
  getElementAttribute?(options: {driver: TDriver; element: TElement; attr: string}): Promise<string>
  getElementText?(options: {driver: TDriver; element: TElement}): Promise<string>
  performAction?(options: {driver: TDriver; steps: any[]}): Promise<void>
  // #endregion
}
