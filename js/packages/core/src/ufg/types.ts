import type {MaybeArray} from '@applitools/utils'
import type * as AutomationCore from '../automation/types'
import {type Logger} from '@applitools/logger'
import {type Proxy} from '@applitools/req'
import {type Renderer, type DomSnapshot, type AndroidSnapshot, type IOSSnapshot} from '@applitools/ufg-client'

export * from '../automation/types'

export type Target<TDriver> =
  | AutomationCore.Target<TDriver>
  | MaybeArray<DomSnapshot>
  | MaybeArray<AndroidSnapshot>
  | MaybeArray<IOSSnapshot>

export interface Core<TDriver, TElement, TSelector>
  extends AutomationCore.Core<TDriver, TElement, TSelector, Eyes<TDriver, TElement, TSelector>> {
  readonly type: 'ufg'
  openEyes(options: {target?: TDriver; settings: OpenSettings; logger?: Logger}): Promise<Eyes<TDriver, TElement, TSelector>>
}

export interface Eyes<TDriver, TElement, TSelector, TTarget = Target<TDriver>>
  extends AutomationCore.Eyes<TDriver, TElement, TSelector, TTarget> {
  check(options?: {target?: TTarget; settings?: CheckSettings<TElement, TSelector>; logger?: Logger}): Promise<CheckResult[]>
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
  autProxy?: Proxy & {mode?: 'Allow' | 'Block'; domains?: string[]}
}

export type CheckResult = AutomationCore.CheckResult & {
  readonly renderer?: Renderer
}

export type TestResult = AutomationCore.TestResult & {
  readonly renderer?: Renderer
}
