import type {Proxy, SpecDriver, Selector, Region} from '@applitools/types'
import type {Eyes as BaseEyes} from '@applitools/types/base'
import type {Target, TestInfo, CheckSettings, CheckResult, DomSnapshot, AndroidVHS, IOSVHS} from '@applitools/types/ufg'
import {type Logger} from '@applitools/logger'
import {type UFGClient, type RenderRequest} from '@applitools/ufg-client'
import {makeDriver} from '@applitools/driver'
import {takeSnapshots} from './utils/take-snapshots'
import {waitForLazyLoad} from '../utils/wait-for-lazy-load'
import {toBaseCheckSettings} from '../utils/to-base-check-settings'
import {generateSafeSelectors} from './utils/generate-safe-selectors'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  getEyes: (options: {rawEnvironment: any}) => Promise<BaseEyes>
  client: UFGClient
  test: TestInfo
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  target?: Target<TDriver>
  logger?: Logger
}

export function makeCheckAndClose<TDriver, TContext, TElement, TSelector>({
  spec,
  getEyes,
  client,
  test,
  target: defaultTarget,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return null
}
