import type {MaybeArray} from '@applitools/utils'
import type {DeleteTestSettings} from './types'
import type {Core as BaseCore} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  core: BaseCore
  logger: Logger
}

export function makeDeleteTest({core, logger: defaultLogger}: Options) {
  return async function deleteTest({
    settings,
    logger = defaultLogger,
  }: {
    settings: MaybeArray<DeleteTestSettings>
    logger?: Logger
  }): Promise<void> {
    ;(utils.types.isArray(settings) ? settings : [settings]).forEach(settings => {
      settings.serverUrl ??= utils.general.getEnvValue('SERVER_URL') ?? 'https://eyesapi.applitools.com'
      settings.apiKey ??= utils.general.getEnvValue('API_KEY')
    })

    await core.deleteTest({settings, logger})
  }
}
