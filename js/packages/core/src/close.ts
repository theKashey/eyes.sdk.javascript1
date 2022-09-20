import type {Config, CloseSettings, TestResult} from '@applitools/types'
import type {Eyes as ClassicEyes} from '@applitools/types/classic'
import type {Eyes as UFGEyes} from '@applitools/types/ufg'
import {type Logger} from '@applitools/logger'
import {TestError} from './errors/test-error'

type Options<TDriver, TElement, TSelector> = {
  eyes: ClassicEyes<TDriver, TElement, TSelector> | UFGEyes<TDriver, TElement, TSelector>
  logger: Logger
}

export function makeClose<TDriver, TElement, TSelector, TType extends 'classic' | 'ufg'>({
  eyes,
  logger: defaultLogger,
}: Options<TDriver, TElement, TSelector>) {
  return async function close({
    settings,
    config,
    logger = defaultLogger,
  }: {
    settings?: CloseSettings<TType>
    config?: Config<TElement, TSelector, TType>
    logger?: Logger
  } = {}): Promise<TestResult<TType>[]> {
    settings = {...config?.close, ...settings}
    settings.updateBaselineIfNew ??= true

    const results = await eyes.close({settings, logger})
    if (settings.throwErr) {
      results.forEach(result => {
        if (result.status !== 'Passed') throw new TestError(result)
      })
    }
    return results
  }
}
