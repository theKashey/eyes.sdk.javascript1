import {Size, Region} from './data'

export type DriverInfo = {
  sessionId?: string
  isMobile?: boolean
  isNative?: boolean
  deviceName?: string
  platformName?: string
  platformVersion?: string
  browserName?: string
  browserVersion?: string
  userAgent?: string
  pixelRatio?: number
  statusBarHeight?: number
  navigationBarHeight?: number
  viewportSize?: Size
  features?: {
    shadowSelector?: boolean
  }
}

export type Selector<TSelector> =
  | TSelector
  | string
  | {selector: TSelector | string; type?: string; shadow?: Selector<TSelector>; frame?: Selector<TSelector>}

export interface SpecDriver<TDriver, TContext, TElement, TSelector> {
  isDriver(driver: any): driver is TDriver
  isContext?(context: any): context is TContext
  isElement(element: any): element is TElement
  isSelector(selector: any): selector is TSelector
  transformDriver?(driver: TDriver): TDriver
  transformElement?(element: TElement): TElement
  transformSelector(selector: TSelector | Selector<TSelector>): TSelector
  extractContext?(element: TDriver | TContext): TContext
  extractSelector?(element: TElement): TSelector
  isStaleElementError(error: any, selector?: TSelector): boolean
  isEqualElements?(context: TContext, element1: TElement, element2: TElement): Promise<boolean>
  mainContext(context: TContext): Promise<TContext>
  parentContext?(context: TContext): Promise<TContext>
  childContext(context: TContext, element: TElement): Promise<TContext>
  executeScript(context: TContext, script: ((arg?: any) => any) | string, arg?: any): Promise<any>
  findElement(context: TContext, selector: TSelector, parent?: TElement): Promise<TElement | null>
  findElements(context: TContext, selector: TSelector, parent?: TElement): Promise<TElement[]>
  click?(context: TContext, element: TElement | TSelector): Promise<void>
  setWindowSize?(driver: TDriver, size: Size): Promise<void>
  getWindowSize?(driver: TDriver): Promise<Size>
  setViewportSize?(driver: TDriver, size: Size): Promise<void>
  getViewportSize?(driver: TDriver): Promise<Size>
  getDriverInfo?(driver: TDriver): Promise<DriverInfo>
  getTitle(driver: TDriver): Promise<string>
  getUrl(driver: TDriver): Promise<string>
  takeScreenshot(driver: TDriver): Promise<Buffer | string>
  visit?(driver: TDriver, url: string): Promise<void>

  getOrientation?(driver: TDriver): Promise<'portrait' | 'landscape'>
  getElementRegion?(driver: TDriver, element: TElement): Promise<Region>
  getElementAttribute?(driver: TDriver, element: TElement, attr: string): Promise<string>
  getElementText?(driver: TDriver, element: TElement): Promise<string>
  performAction?(driver: TDriver, steps: any[]): Promise<void>
}
