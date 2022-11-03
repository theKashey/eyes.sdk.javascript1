import type {Config, CloseSettings, TestResult} from './types'
import type {Eyes as ClassicEyes} from './classic/types'
import type {Eyes as UFGEyes} from './ufg/types'
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
    return results.length > 0
      ? results
      : [
          {
            userTestId: eyes.test.userTestId,
            name: '',
            steps: 0,
            matches: 0,
            mismatches: 0,
            missing: 0,
            exactMatches: 0,
            strictMatches: 0,
            contentMatches: 0,
            layoutMatches: 0,
            noneMatches: 0,
          },
        ]
  }
}
