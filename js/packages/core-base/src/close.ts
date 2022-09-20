import type {CloseSettings, TestResult} from '@applitools/types/base'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'

type Options = {
  requests: EyesRequests
  logger: Logger
}

export function makeClose({requests, logger: defaultLogger}: Options) {
  return async function close({
    settings,
    logger = defaultLogger,
  }: {
    settings?: CloseSettings
    logger?: Logger
  } = {}): Promise<TestResult[]> {
    logger.log('Command "close" is called with settings', settings)
    const results = await requests.close({settings, logger})
    return results
  }
}
