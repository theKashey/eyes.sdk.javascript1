import type {Region, SpecDriver, Config, LocateSettings} from '@applitools/types'
import type {Core as BaseCore} from '@applitools/types/base'
import type {Screenshot} from '@applitools/types/classic'
import {type Logger} from '@applitools/logger'
import {makeCore as makeClassicCore} from './classic/core'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
  core: BaseCore
  logger: Logger
}

export function makeLocate<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg'>({
  spec,
  core,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function locate<TLocator extends string>({
    target,
    settings,
    config,
    logger = defaultLogger,
  }: {
    target?: TDriver | Screenshot
    settings: LocateSettings<TLocator, TElement, TSelector>
    config?: Config<TElement, TSelector, TType>
    logger?: Logger
  }): Promise<Record<TLocator, Region[]>> {
    settings = {...config?.open, ...config?.screenshot, ...settings}
    settings.serverUrl ??= utils.general.getEnvValue('SERVER_URL') ?? 'https://eyesapi.applitools.com'
    settings.apiKey ??= utils.general.getEnvValue('API_KEY')

    const classicCore = makeClassicCore({spec, core, logger})

    const results = await classicCore.locate({target, settings, logger})
    return results
  }
}
