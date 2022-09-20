import {MaybeArray} from './types'
import {AutProxy, Renderer} from './data'
import {Cookie} from './driver'
import {Logger} from './debug'
import * as AutomationCore from './core-automation'

export * from './core-automation'

export type DomSnapshot = {
  cdt: any[]
  url: string
  resourceUrls: string[]
  resourceContents: Record<string, {type: string; value: Buffer}>
  frames: DomSnapshot[]
  cookies?: Cookie[]
}
export type AndroidVHS = {
  platformName: 'android'
  vhsType: string
  vhsHash: {hashFormat: string; hash: string; contentType: string}
}
export type IOSVHS = {
  platformName: 'ios'
  vhsCompatibilityParams: Record<string, any>
} & (
  | {resourceContents: Record<string, {type: string; value: Buffer}>}
  | {vhsHash: {hashFormat: string; hash: string; contentType: string}}
)

export type Target<TDriver> =
  | AutomationCore.Target<TDriver>
  | MaybeArray<DomSnapshot>
  | MaybeArray<AndroidVHS>
  | MaybeArray<IOSVHS>

export interface Core<TDriver, TElement, TSelector>
  extends AutomationCore.Core<TDriver, TElement, TSelector, Eyes<TDriver, TElement, TSelector>> {
  readonly type: 'ufg'
  openEyes(options: {
    target?: TDriver
    settings: OpenSettings
    logger?: Logger
  }): Promise<Eyes<TDriver, TElement, TSelector>>
}

export interface Eyes<TDriver, TElement, TSelector, TTarget = Target<TDriver>>
  extends AutomationCore.Eyes<TDriver, TElement, TSelector, TTarget> {
  check(options?: {
    target?: TTarget
    settings?: CheckSettings<TElement, TSelector>
    logger?: Logger
  }): Promise<CheckResult[]>
  checkAndClose(options?: {
    target?: TTarget
    settings?: CheckSettings<TElement, TSelector> & AutomationCore.CloseSettings
    logger?: Logger
  }): Promise<TestResult[]>
  locateText?: never
  extractText?: never
  close(options?: {settings?: AutomationCore.CloseSettings; logger?: Logger}): Promise<TestResult[]>
  abort(options?: {logger?: Logger}): Promise<TestResult[]>
}

export type OpenSettings = AutomationCore.OpenSettings & {
  renderConcurrency?: number
}

export type CheckSettings<TElement, TSelector> = AutomationCore.CheckSettings<TElement, TSelector> & {
  renderers?: Renderer[]
  hooks?: {beforeCaptureScreenshot: string}
  disableBrowserFetching?: boolean
  layoutBreakpoints?: boolean | number[]
  ufgOptions?: Record<string, any>
  autProxy?: AutProxy
}

export type CheckResult = AutomationCore.CheckResult & {
  readonly renderer?: Renderer
}

export type TestResult = AutomationCore.TestResult & {
  readonly renderer?: Renderer
}
