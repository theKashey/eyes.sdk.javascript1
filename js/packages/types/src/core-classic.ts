import {Logger} from './debug'
import * as AutomationCore from './core-automation'

export * from './core-automation'

export type Target<TDriver> = AutomationCore.Target<TDriver> | AutomationCore.Screenshot

export interface Core<TDriver, TElement, TSelector>
  extends AutomationCore.Core<TDriver, TElement, TSelector, Eyes<TDriver, TElement, TSelector>> {
  readonly type: 'classic'
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
  }): Promise<AutomationCore.CheckResult[]>
  checkAndClose(options: {
    target?: TTarget
    settings?: CheckSettings<TElement, TSelector> & AutomationCore.CloseSettings
    logger?: Logger
  }): Promise<AutomationCore.TestResult[]>
}

export type OpenSettings = AutomationCore.OpenSettings & {
  keepPlatformNameAsIs?: boolean
}

export type CheckSettings<TElement, TSelector> = AutomationCore.CheckSettings<TElement, TSelector> & {
  retryTimeout?: number
}
