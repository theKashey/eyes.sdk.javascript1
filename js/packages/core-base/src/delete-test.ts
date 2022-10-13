import type {DeleteTestSettings} from './types'
import {type MaybeArray} from '@applitools/utils'
import {type Logger} from '@applitools/logger'
import {type CoreRequests} from './server/requests'
import * as utils from '@applitools/utils'

type Options = {
  requests: CoreRequests
  logger: Logger
}

export function makeDeleteTest({requests, logger: defaultLogger}: Options) {
  return async function deleteTest({
    settings,
    logger = defaultLogger,
  }: {
    settings: MaybeArray<DeleteTestSettings>
    logger?: Logger
  }): Promise<void> {
    logger.log('Command "deleteTest" is called with settings', settings)
    settings = utils.types.isArray(settings) ? settings : [settings]
    const results = await Promise.allSettled(settings.map(settings => requests.deleteTest({settings, logger})))
    const error = results.find(({status}) => status === 'rejected') as PromiseRejectedResult
    if (error) throw error.reason
  }
}
