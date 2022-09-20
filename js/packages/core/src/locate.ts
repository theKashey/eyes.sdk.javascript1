import type {Region, Target, Config, LocateSettings} from '@applitools/types'
import type {Core as ClassicCore} from '@applitools/types/classic'
import type {Core as UFGCore} from '@applitools/types/ufg'
import {type Logger} from '@applitools/logger'

type Options<TDriver, TElement, TSelector> = {
  core: ClassicCore<TDriver, TElement, TSelector> | UFGCore<TDriver, TElement, TSelector>
  logger: Logger
}

export function makeLocate<TDriver, TElement, TSelector, TType extends 'classic' | 'ufg'>({
  core,
  logger: defaultLogger,
}: Options<TDriver, TElement, TSelector>) {
  return async function locate<TLocator extends string>({
    target,
    settings,
    config,
    logger = defaultLogger,
  }: {
    target?: Target<TDriver, TType>
    settings: LocateSettings<TLocator, TElement, TSelector>
    config?: Config<TElement, TSelector, TType>
    logger?: Logger
  }): Promise<Record<TLocator, Region[]>> {
    settings = {...config?.open, ...config?.screenshot, ...settings}

    const results = await core.locate({target: target as any, settings, logger})
    return results
  }
}
