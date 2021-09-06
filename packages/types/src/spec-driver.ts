import {Size, DriverInfo, Region} from './data'

export type SpecSelector<TSelector> =
  | TSelector
  | string
  | {selector: TSelector | string; type?: string; shadow?: SpecSelector<TSelector>}

export interface SpecDriver<TDriver, TContext, TElement, TSelector> {
  isDriver(driver: any): driver is TDriver
  isContext?(context: any): context is TContext
  isElement(element: any): element is TElement
  isSelector(selector: any): selector is SpecSelector<TSelector>
  transformDriver?(driver: any): TDriver
  transformElement?(element: any): TElement
  extractContext?(element: TDriver | TContext): TContext
  extractSelector?(element: TElement): SpecSelector<TSelector>
  isStaleElementError(error: any, selector?: SpecSelector<TSelector>): boolean
  isEqualElements?(context: TContext, element1: TElement, element2: TElement): Promise<boolean>
  mainContext(context: TContext): Promise<TContext>
  parentContext?(context: TContext): Promise<TContext>
  childContext(context: TContext, element: TElement): Promise<TContext>
  executeScript(context: TContext, script: ((arg?: any) => any) | string, arg?: any): Promise<any>
  findElement(context: TContext, selector: SpecSelector<TSelector>, parent?: TElement): Promise<TElement | null>
  findElements(context: TContext, selector: SpecSelector<TSelector>, parent?: TElement): Promise<TElement[]>
  click?(context: TContext, element: TElement | SpecSelector<TSelector>): Promise<void>
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
