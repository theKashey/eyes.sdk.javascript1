import type {MaybeArray} from '@applitools/utils'
import type {Target, ExtractTextSettings} from './types'
import type {Eyes as BaseEyes, Target as BaseTarget, ExtractTextSettings as BaseExtractTextSettings} from '@applitools/core-base'
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

export function makeExtractText<TDriver, TContext, TElement, TSelector>({
  spec,
  eyes,
  target: defaultTarget,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function extractText({
    target = defaultTarget,
    settings,
    logger = defaultLogger,
  }: {
    target?: Target<TDriver>
    settings?: MaybeArray<ExtractTextSettings<TElement, TSelector>>
    logger?: Logger
  } = {}): Promise<string[]> {
    logger.log('Command "extractText" is called with settings', settings)
    if (!spec.isDriver(target)) {
      return eyes.extractText({target, settings: settings as MaybeArray<BaseExtractTextSettings>, logger})
    }
    settings = utils.types.isArray(settings) ? settings : [settings]
    // TODO driver custom config
    const driver = await makeDriver({spec, driver: target, logger})
    const results = await settings.reduce(async (prev, settings) => {
      const steps = await prev
      const screenshot = await takeScreenshot({driver, settings, logger})
      if (!settings.hint && !utils.types.has(settings.region, ['x', 'y', 'width', 'height'])) {
        const element = await driver.currentContext.element(settings.region)
        if (!element) throw new Error(`Unable to find element using provided selector`)
        // TODO create a separate snippet with more sophisticated logic
        settings.hint = await driver.currentContext.execute('return arguments[0].innerText', element)
        if (settings.hint) settings.hint = settings.hint.replace(/[.\\+]/g, '\\$&')
      }
      const baseTarget: BaseTarget = {
        image: await screenshot.image.toPng(),
        size: utils.geometry.size(screenshot.region),
        locationInViewport: utils.geometry.location(screenshot.region),
      }
      if (driver.isWeb) {
        if (settings.fully) await screenshot.scrollingElement.setAttribute('data-applitools-scroll', 'true')
        baseTarget.dom = await takeDomCapture({driver, logger}).catch(() => null)
      }
      delete settings.region
      delete settings.normalization
      const results = await eyes.extractText({target: baseTarget, settings: settings as BaseExtractTextSettings, logger})
      steps.push(results)
      return steps
    }, Promise.resolve([] as string[][]))
    return results.flat()
  }
}
