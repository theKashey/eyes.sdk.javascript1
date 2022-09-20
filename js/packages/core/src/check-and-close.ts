import type {Target, Config, CheckSettings, CloseSettings, TestResult} from '@applitools/types'
import type {Eyes as ClassicEyes} from '@applitools/types/classic'
import type {Eyes as UFGEyes} from '@applitools/types/ufg'
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
    settings = {...config?.screenshot, ...config?.check, ...config?.close, ...settings}
    const results = await eyes.checkAndClose({target: target as any, settings, logger})
    return results
  }
}
