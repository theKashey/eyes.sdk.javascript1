import type {AbortSettings, TestResult} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'

type Options = {
  requests: EyesRequests
  logger: Logger
}

export function makeAbort({requests, logger: defaultLogger}: Options) {
  let results
  return async function abort({
    settings,
    logger = defaultLogger,
  }: {
    settings?: AbortSettings
    logger?: Logger
  } = {}): Promise<TestResult[]> {
    logger.log('Command "close" is called with settings', settings)
    results ??= await requests.abort({logger})
    return results
  }
}
