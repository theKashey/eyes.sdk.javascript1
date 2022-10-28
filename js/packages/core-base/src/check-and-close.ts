import type {Target, CheckSettings, CloseSettings, TestResult} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'
import {transformTarget} from './utils/transform-target'

type Options = {
  requests: EyesRequests
  logger: Logger
}

export function makeCheckAndClose({requests, logger: defaultLogger}: Options) {
  return async function checkAndClose({
    target,
    settings,
    logger = defaultLogger,
  }: {
    target: Target
    settings?: CheckSettings & CloseSettings
    logger?: Logger
  }): Promise<TestResult[]> {
    logger.log('Command "checkAndClose" is called with settings', settings)
    if (!target.isTransformed) {
      target = await transformTarget({target, settings})
    }
    const results = await requests.checkAndClose({target, settings, logger})
    return results
  }
}
