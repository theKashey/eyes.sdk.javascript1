import type {TextRegion} from '@applitools/types'
import type {Target, LocateTextSettings} from '@applitools/types/base'
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
  }): Promise<Record<TPattern, TextRegion[]>> {
    logger.log('Command "locateText" is called with settings', settings)
    target.image = await transformImage({image: target.image, settings})
    const results = await requests.locateText({target, settings, logger})
    return results
  }
}
