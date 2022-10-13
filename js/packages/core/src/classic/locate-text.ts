import type {Target, LocateTextSettings, LocateTextResult} from './types'
import type {Eyes as BaseEyes, Target as BaseTarget, LocateTextSettings as BaseLocateTextSettings} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, type SpecDriver} from '@applitools/driver'
import {takeScreenshot} from '../automation/utils/take-screenshot'
import {takeDomCapture} from './utils/take-dom-capture'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
  eyes: BaseEyes
  target?: Target<TDriver>
  logger?: Logger
}

export function makeLocateText<TDriver, TContext, TElement, TSelector>({
  spec,
  eyes,
  target: defaultTarget,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function locateText<TPattern extends string>({
    target = defaultTarget,
    settings,
    logger = defaultLogger,
  }: {
    target?: Target<TDriver>
    settings?: LocateTextSettings<TPattern, TElement, TSelector>
    logger?: Logger
  } = {}): Promise<LocateTextResult<TPattern>> {
    logger.log('Command "check" is called with settings', settings)
    if (!spec.isDriver(target)) {
      return eyes.locateText({target, settings: settings as BaseLocateTextSettings<TPattern>, logger})
    }
    // TODO driver custom config
    const driver = await makeDriver({spec, driver: target, logger})
    const screenshot = await takeScreenshot({driver, settings, logger})
    const baseTarget: BaseTarget = {
      image: await screenshot.image.toPng(),
      locationInViewport: utils.geometry.location(screenshot.region),
    }
    if (driver.isWeb) {
      if (settings.fully) await screenshot.scrollingElement.setAttribute('data-applitools-scroll', 'true')
      baseTarget.dom = await takeDomCapture({driver, logger}).catch(() => null)
    }
    const results = await eyes.locateText({target: baseTarget, settings: settings as BaseLocateTextSettings<TPattern>, logger})
    return results
  }
}
