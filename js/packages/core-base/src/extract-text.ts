import type {Target, ExtractTextSettings} from './types'
import {type MaybeArray} from '@applitools/utils'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'
import {transformImage} from './utils/transform-image'
import * as utils from '@applitools/utils'

type Options = {
  requests: EyesRequests
  logger: Logger
}

export function makeExtractText({requests, logger: defaultLogger}: Options) {
  return async function extractText({
    target,
    settings,
    logger = defaultLogger,
  }: {
    target: Target
    settings?: MaybeArray<ExtractTextSettings>
    logger?: Logger
  }): Promise<string[]> {
    logger.log('Command "extractText" is called with settings', settings)
    settings = utils.types.isArray(settings) ? settings : [settings]
    const results = await Promise.all(
      settings.map(async settings => {
        target.image = await transformImage({image: target.image, settings})
        return requests.extractText({target, settings, logger})
      }),
    )
    return results.flat()
  }
}
