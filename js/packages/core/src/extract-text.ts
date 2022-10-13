import type {MaybeArray} from '@applitools/utils'
import type {Target, Config, ExtractTextSettings} from './types'
import type {Eyes as ClassicEyes} from './classic/types'
import type {Eyes as UFGEyes} from './ufg/types'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options<TDriver, TElement, TSelector> = {
  eyes: ClassicEyes<TDriver, TElement, TSelector> | UFGEyes<TDriver, TElement, TSelector>
  logger: Logger
}

export function makeExtractText<TDriver, TElement, TSelector, TType extends 'classic' | 'ufg'>({
  eyes,
  logger: defaultLogger,
}: Options<TDriver, TElement, TSelector>) {
  return async function extractText({
    target,
    settings,
    config,
    logger = defaultLogger,
  }: {
    target?: Target<TDriver, TType>
    settings: MaybeArray<ExtractTextSettings<TElement, TSelector, TType>>
    config?: Config<TElement, TSelector, TType>
    logger?: Logger
  }): Promise<string[]> {
    settings = utils.types.isArray(settings)
      ? settings.map(settings => ({...config?.screenshot, ...settings}))
      : {...config?.screenshot, ...settings}
    const results = await eyes.extractText({target: target as any, settings, logger})
    return results
  }
}
