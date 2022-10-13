import type {Target, LocateTextSettings, LocateTextResult} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'
import {transformImage} from './utils/transform-image'

type Options = {
  requests: EyesRequests
  logger: Logger
}

export function makeLocateText({requests, logger: defaultLogger}: Options) {
  return async function locateText<TPattern extends string>({
    target,
    settings,
    logger = defaultLogger,
  }: {
    target: Target
    settings?: LocateTextSettings<TPattern>
    logger?: Logger
  }): Promise<LocateTextResult<TPattern>> {
    logger.log('Command "locateText" is called with settings', settings)
    target.image = await transformImage({image: target.image, settings})
    const results = await requests.locateText({target, settings, logger})
    return results
  }
}
