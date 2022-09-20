import type {MaybeArray} from '@applitools/types'
import type {CloseBatchSettings} from '@applitools/types/base'
import {type Logger} from '@applitools/logger'
import {type CoreRequests} from './server/requests'
import * as utils from '@applitools/utils'

type Options = {
  requests: CoreRequests
  logger?: Logger
}

export function makeCloseBatch({requests, logger: defaultLogger}: Options) {
  return async function closeBatch({
    settings,
    logger = defaultLogger,
  }: {
    settings: MaybeArray<CloseBatchSettings>
    logger?: Logger
  }): Promise<void> {
    logger?.log('Command "closeBatch" is called with settings', settings)
    settings = utils.types.isArray(settings) ? settings : [settings]
    const results = await Promise.allSettled(
      settings.map(settings => (settings.batchId ? requests.closeBatch({settings, logger}) : null)),
    )
    const error = results.find(({status}) => status === 'rejected') as PromiseRejectedResult
    if (error) throw error.reason
  }
}
