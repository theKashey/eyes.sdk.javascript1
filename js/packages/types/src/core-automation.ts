import {MaybeArray} from './types'
import {Region, TextRegion, StitchMode, Size} from './data'
import {Selector} from './driver'
import {Logger} from './debug'
import * as BaseCore from './core-base'

export * from './core-base'

export type Screenshot = BaseCore.Target

export type Target<TDriver> = TDriver

export interface Core<TDriver, TElement, TSelector, TEyes = Eyes<TDriver, TElement, TSelector>>
  extends BaseCore.Core<TEyes> {
  isDriver(driver: any): driver is TDriver
  isElement(element: any): element is TElement
  isSelector(selector: any): selector is TSelector
  getViewportSize(options: {target: TDriver; logger?: Logger}): Promise<Size>
  setViewportSize(options: {target: TDriver; size: Size; logger?: Logger}): Promise<void>
  openEyes(options: {target?: TDriver; settings: BaseCore.OpenSettings; logger?: Logger}): Promise<TEyes>
  locate<TLocator extends string>(options: {
    target?: Target<TDriver> | Screenshot
    settings: LocateSettings<TLocator, TElement, TSelector>
    logger?: Logger
  }): Promise<Record<TLocator, Region[]>>
}

export interface Eyes<TDriver, TElement, TSelector, TTarget = Target<TDriver>> extends BaseCore.Eyes<TTarget> {
  check(options: {target?: TTarget; settings?: CheckSettings<TElement, TSelector>}): Promise<BaseCore.CheckResult[]>
  checkAndClose(options: {
    target?: TTarget
    settings?: CheckSettings<TElement, TSelector> & BaseCore.CloseSettings
    logger?: Logger
  }): Promise<BaseCore.TestResult[]>
  locateText?<TPattern extends string>(options: {
    target?: TTarget
    settings: LocateTextSettings<TPattern, TElement, TSelector>
    logger?: Logger
  }): Promise<Record<TPattern, TextRegion[]>>
  extractText?(options: {
    target?: TTarget
    settings: MaybeArray<ExtractTextSettings<TElement, TSelector>>
    logger?: Logger
  }): Promise<string[]>
}

type RegionReference<TElement, TSelector> = Region | ElementReference<TElement, TSelector>
type ElementReference<TElement, TSelector> = TElement | Selector<TSelector>
type FrameReference<TElement, TSelector> = ElementReference<TElement, TSelector> | string | number
type ContextReference<TElement, TSelector> = {
  frame: FrameReference<TElement, TSelector>
  scrollRootElement?: ElementReference<TElement, TSelector>
}
export interface ScreenshotSettings<TElement, TSelector>
  extends BaseCore.ImageSettings<RegionReference<TElement, TSelector>> {
  frames?: (ContextReference<TElement, TSelector> | FrameReference<TElement, TSelector>)[]
  fully?: boolean
  scrollRootElement?: ElementReference<TElement, TSelector>
  stitchMode?: StitchMode
  hideScrollbars?: boolean
  hideCaret?: boolean
  overlap?: {top?: number; bottom?: number}
  waitBeforeCapture?: number
  waitBetweenStitches?: number
  lazyLoad?: boolean | {scrollLength?: number; waitingTime?: number; maxAmountToScroll?: number}
}

export type LocateSettings<TLocator extends string, TElement, TSelector> = BaseCore.LocateSettings<
  TLocator,
  RegionReference<TElement, TSelector>
> &
  ScreenshotSettings<TElement, TSelector>

export type CheckSettings<TElement, TSelector> = BaseCore.CheckSettings<RegionReference<TElement, TSelector>> &
  ScreenshotSettings<TElement, TSelector>

export type LocateTextSettings<TPattern extends string, TElement, TSelector> = BaseCore.LocateTextSettings<
  TPattern,
  RegionReference<TElement, TSelector>
> &
  ScreenshotSettings<TElement, TSelector>

export type ExtractTextSettings<TElement, TSelector> = BaseCore.ExtractTextSettings<
  RegionReference<TElement, TSelector>
> &
  ScreenshotSettings<TElement, TSelector>
