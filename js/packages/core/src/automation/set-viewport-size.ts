import type {SpecDriver, Size} from '@applitools/types'
import {type Logger} from '@applitools/logger'
import {Driver} from '@applitools/driver'

type Options<TDriver, TContext, TElement, TSelector> = {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger?: Logger
}

export function makeSetViewportSize<TDriver, TContext, TElement, TSelector>({
  spec,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function setViewportSize({target, size, logger = defaultLogger}: {target: TDriver; size: Size; logger?: Logger}) {
    logger.log('Command "setViewportSize" is called with size', size)
    const driver = await new Driver<TDriver, TContext, TElement, TSelector>({spec, driver: target, logger}).init()
    return driver.setViewportSize(size)
  }
}
