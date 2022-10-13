import type {Size} from '@applitools/utils'
import {type Logger} from '@applitools/logger'
import {makeDriver, type SpecDriver} from '@applitools/driver'

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
    const driver = await makeDriver<TDriver, TContext, TElement, TSelector>({spec, driver: target, logger})
    return driver.setViewportSize(size)
  }
}
