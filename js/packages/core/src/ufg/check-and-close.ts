import type {SpecDriver} from '@applitools/types'
import type {Eyes as BaseEyes} from '@applitools/types/base'
import type {Target, TestInfo} from '@applitools/types/ufg'
import {type Logger} from '@applitools/logger'
import {type UFGClient} from '@applitools/ufg-client'

type Options<TDriver, TContext, TElement, TSelector> = {
  getEyes: (options: {rawEnvironment: any}) => Promise<BaseEyes>
  client: UFGClient
  test: TestInfo
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  target?: Target<TDriver>
  logger?: Logger
}

export function makeCheckAndClose<TDriver, TContext, TElement, TSelector>(
  _options: Options<TDriver, TContext, TElement, TSelector>,
) {
  return null
}
