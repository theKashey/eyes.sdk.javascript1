import {Region, Selector} from '@applitools/types'
import {CheckSettings as BaseCheckSettings} from '@applitools/types/base'
import {CheckSettings as ClassicCheckSettings} from '@applitools/types/classic'
import {CheckSettings as UFGCheckSettings} from '@applitools/types/ufg'
import * as utils from '@applitools/utils'

export function toBaseCheckSettings<TElement, TSelector>({
  settings,
}: {
  settings: ClassicCheckSettings<TElement, TSelector> | UFGCheckSettings<TElement, TSelector>
}) {
  const regionTypes = ['ignore', 'layout', 'strict', 'content', 'floating', 'accessibility'] as const
  const elementReferencesToCalculate = regionTypes.flatMap(regionType => {
    return (settings[`${regionType}Regions`] ?? []).reduce((regions, reference) => {
      const {region} = utils.types.has(reference, 'region') ? reference : {region: reference}
      return !isRegion(region) ? regions.concat(region) : regions
    }, [] as (TElement | Selector<TSelector>)[])
  })

  const elementReferenceToTarget = !isRegion(settings.region) ? settings.region : undefined

  return {elementReferencesToCalculate, elementReferenceToTarget, getBaseCheckSettings}

  function getBaseCheckSettings({
    calculatedRegions,
    preserveTransformation,
  }: {
    calculatedRegions: {selector: Selector; regions: Region[]}[]
    preserveTransformation?: boolean
  }): BaseCheckSettings {
    const transformedSettings = {...settings}

    if (!preserveTransformation) {
      delete transformedSettings.region
      delete transformedSettings.normalization
    } else if (elementReferenceToTarget) {
      delete transformedSettings.region
    }

    regionTypes.forEach(regionType => {
      if (!transformedSettings[`${regionType}Regions`]) return
      transformedSettings[`${regionType}Regions`] = transformedSettings[`${regionType}Regions`].flatMap(reference => {
        const {region, ...options} = utils.types.has(reference, 'region') ? reference : {region: reference}
        if (isRegion(region)) return reference
        const {selector, regions} = calculatedRegions.shift()
        return regions.map(region => ({
          region,
          regionId: utils.types.isString(selector) ? selector : selector?.selector,
          ...options,
        }))
      })
    })
    return transformedSettings as BaseCheckSettings
  }

  function isRegion(region: any): region is Region {
    return utils.types.has(region, ['x', 'y', 'width', 'height'])
  }
}
