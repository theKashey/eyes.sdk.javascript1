import type {MaybeArray, CloseBatchSettings} from '@applitools/types'
import type {Core as BaseCore} from '@applitools/types/base'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  core: BaseCore
  logger: Logger
}

export function makeCloseBatch({core, logger: defaultLogger}: Options) {
  return async function closeBatch({
    settings,
    logger = defaultLogger,
  }: {
    settings: MaybeArray<CloseBatchSettings>
    logger?: Logger
  }): Promise<void> {
    const defaultSettings = {} as CloseBatchSettings
    defaultSettings.serverUrl ??= utils.general.getEnvValue('SERVER_URL') ?? 'https://eyesapi.applitools.com'
    defaultSettings.apiKey ??= utils.general.getEnvValue('API_KEY')

    settings = utils.types.isArray(settings)
      ? settings.map(settings => ({...defaultSettings, ...settings}))
      : {...defaultSettings, ...settings}
    await core.closeBatch({settings, logger})
  }
}
