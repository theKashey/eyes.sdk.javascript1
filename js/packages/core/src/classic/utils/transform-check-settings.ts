import type {CheckSettings as BaseCheckSettings} from '@applitools/types/base'
import type {CheckSettings} from '@applitools/types/classic'
import {type Logger} from '@applitools/logger'
import {type Context} from '@applitools/driver'
import {type Screenshot} from '../../automation/utils/take-screenshot'
import * as utils from '@applitools/utils'

type RegionType = 'ignore' | 'layout' | 'content' | 'strict' | 'floating' | 'accessibility'

export async function transformCheckSettings<TDriver, TContext, TElement, TSelector>({
  context,
  settings,
  screenshot,
  logger: _logger,
}: {
  context: Context<TDriver, TContext, TElement, TSelector>
  settings: CheckSettings<TElement, TSelector>
  screenshot: Screenshot
  logger: Logger
}): Promise<BaseCheckSettings> {
  return {
    ...settings,
    region: undefined,
    normalization: undefined,
    ignoreRegions: await transformRegions<'ignore'>({regions: settings.ignoreRegions}),
    layoutRegions: await transformRegions<'layout'>({regions: settings.layoutRegions}),
    contentRegions: await transformRegions<'content'>({regions: settings.contentRegions}),
    strictRegions: await transformRegions<'strict'>({regions: settings.strictRegions}),
    floatingRegions: await transformRegions<'floating'>({regions: settings.floatingRegions}),
    accessibilityRegions: await transformRegions<'accessibility'>({regions: settings.accessibilityRegions}),
  }

  async function transformRegions<TRegionType extends RegionType>({
    regions = [],
  }: {
    regions: CheckSettings<TElement, TSelector>[`${TRegionType}Regions`][number][]
  }): Promise<BaseCheckSettings[`${TRegionType}Regions`][number][]> {
    const transformedRegions = [] as BaseCheckSettings[`${TRegionType}Regions`][number][]
    for (const region of regions) {
      const {region: reference, ...options} = utils.types.has(region, 'region') ? region : {region}
      if (utils.types.has(reference, ['x', 'y', 'width', 'height'])) {
        transformedRegions.push(region as BaseCheckSettings[`${TRegionType}Regions`][number])
      } else {
        const elements = await context.elements(reference as any)
        if (elements.length === 0) continue
        const contextLocationInViewport = await elements[0].context.getLocationInViewport()
        for (const element of elements) {
          const elementRegionInViewport = utils.geometry.offset(await element.getRegion(), contextLocationInViewport)
          const elementRegionInTarget = utils.geometry.offsetNegative(
            elementRegionInViewport,
            utils.geometry.location(screenshot.region),
          )
          const elementRegionIScaled = utils.geometry.scale(elementRegionInTarget, context.driver.viewportScale)
          transformedRegions.push({
            region: elementRegionIScaled,
            regionId: utils.types.isString(element.commonSelector) ? element.commonSelector : element.commonSelector?.selector,
            ...options,
          })
        }
      }
    }
    return transformedRegions
  }
}
