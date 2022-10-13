import {type Logger} from '@applitools/logger'
import {makeDriver, type SpecDriver} from '@applitools/driver'

type Options<TDriver, TContext, TElement, TSelector> = {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger?: Logger
}

export function makeGetViewportSize<TDriver, TContext, TElement, TSelector>({
  spec,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function getViewportSize({target, logger = defaultLogger}: {target: TDriver; logger?: Logger}) {
    logger.log('Command "getViewportSize" is called')
    const driver = await makeDriver<TDriver, TContext, TElement, TSelector>({spec, driver: target, logger})
    return driver.getViewportSize()
  }
}
