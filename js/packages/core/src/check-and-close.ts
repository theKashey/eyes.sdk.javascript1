import type {Target, Config, CheckSettings, CloseSettings, TestResult} from './types'
import type {Eyes as ClassicEyes} from './classic/types'
import type {Eyes as UFGEyes} from './ufg/types'
import {type Logger} from '@applitools/logger'

type Options<TDriver, TElement, TSelector> = {
  eyes: ClassicEyes<TDriver, TElement, TSelector> | UFGEyes<TDriver, TElement, TSelector>
  logger: Logger
}

export function makeCheckAndClose<TDriver, TElement, TSelector, TType extends 'classic' | 'ufg' = 'classic' | 'ufg'>({
  eyes,
  logger: defaultLogger,
}: Options<TDriver, TElement, TSelector>) {
  return async function checkAndClose({
    target,
    settings = {},
    config,
    logger = defaultLogger,
  }: {
    target?: Target<TDriver, TType>
    settings?: CheckSettings<TElement, TSelector, TType> & CloseSettings<TType>
    config?: Config<TElement, TSelector, TType>
    logger?: Logger
  } = {}): Promise<TestResult<TType>[]> {
    settings = {...config?.screenshot, ...config?.check, ...config?.close, ...settings} as CheckSettings<
      TElement,
      TSelector,
      'classic'
    > &
      CloseSettings<'classic'>
    const results = await (eyes as ClassicEyes<TDriver, TElement, TSelector>).checkAndClose({
      target: target as any,
      settings,
      logger,
    })
    return results
  }
}
