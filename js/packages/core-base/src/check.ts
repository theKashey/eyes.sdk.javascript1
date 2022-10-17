import type {Target, CheckSettings, CheckResult} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'
import {transformImage} from './utils/transform-image'

type Options = {
  requests: EyesRequests
  logger: Logger
}

export function makeCheck({requests, logger: defaultLogger}: Options) {
  return async function check({
    target,
    settings = {},
    logger = defaultLogger,
  }: {
    target: Target
    settings?: CheckSettings
    logger?: Logger
  }): Promise<CheckResult[]> {
    logger.log('Command "check" is called with settings', settings)
    target.image = await transformImage({image: target.image, settings})
    return requests.check({target, settings, logger})
  }
}
