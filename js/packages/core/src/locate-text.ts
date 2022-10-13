import type {Target, Config, LocateTextSettings, LocateTextResult} from './types'
import type {Eyes as ClassicEyes} from './classic/types'
import type {Eyes as UFGEyes} from './ufg/types'
import {type Logger} from '@applitools/logger'

type Options<TDriver, TElement, TSelector> = {
  eyes: ClassicEyes<TDriver, TElement, TSelector> | UFGEyes<TDriver, TElement, TSelector>
  logger: Logger
}

export function makeLocateText<TDriver, TElement, TSelector, TType extends 'classic' | 'ufg' = 'classic' | 'ufg'>({
  eyes,
  logger: defaultLogger,
}: Options<TDriver, TElement, TSelector>) {
  return async function locateText<TPattern extends string>({
    target,
    settings,
    config,
    logger = defaultLogger,
  }: {
    target?: Target<TDriver, TType>
    settings: LocateTextSettings<TPattern, TElement, TSelector, TType>
    config?: Config<TElement, TSelector, TType>
    logger?: Logger
  }): Promise<LocateTextResult<TPattern>> {
    settings = {...config?.screenshot, ...settings}
    const results = await eyes.locateText({target: target as any, settings, logger})
    return results
  }
}
