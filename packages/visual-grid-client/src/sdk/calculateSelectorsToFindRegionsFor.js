'use strict'

const {Region} = require('@applitools/eyes-sdk-core')
const utils = require('@applitools/utils')

function selectorObject({selector, type}) {
  return type === 'xpath' || type === 'css' ? {type, selector} : selector
}
function tempProxyToGeometryWithPadding(regionObject, padding) {
  const {width, height, left: x, top: y} = regionObject
  const tempRegionObject = {width, height, x, y}
  const res = utils.geometry.withPadding(tempRegionObject, padding)
  return {
    width: res.width,
    height: res.height,
    left: res.x,
    top: res.y,
  }
}

function calculateSelectorsToFindRegionsFor({
  ignore,
  layout,
  strict,
  content,
  accessibility,
  floating,
}) {
  const userRegions = Object.entries({
    ignore,
    layout,
    strict,
    content,
    accessibility,
    floating,
  }).reduce((entries, [name, regions]) => {
    if (regions) {
      entries.set(name, Array.isArray(regions) ? regions : [regions])
    }
    return entries
  }, new Map())

  if (userRegions.size === 0) {
    return {getMatchRegions}
  }

  const selectorsToFindRegionsFor = Array.from(userRegions.values()).reduce((prev, regions) => {
    prev.push(...regions.filter(region => region.selector).map(selectorObject))
    return prev
  }, [])

  // NOTE: in rare cases there might be duplicates here. Intentionally not removing them because later we map `selectorsToFindRegionsFor` to `selectorRegions`.
  return {selectorsToFindRegionsFor, getMatchRegions}

  function getMatchRegions({selectorRegions, imageLocation}) {
    let selectorRegionIndex = 0
    return Array.from(userRegions.entries()).reduce((allRegions, [regionName, userInput]) => {
      const regionValues = userInput.reduce((regions, userRegion) => {
        const codedRegions = userRegion.selector
          ? selectorRegions[selectorRegionIndex++]
          : [userRegion]

        if (codedRegions && codedRegions.length > 0) {
          codedRegions.forEach(region => {
            const regionObject = regionify({region})
            if (imageLocation && userRegion.selector) {
              regionObject.left = Math.max(0, regionObject.left - imageLocation.x)
              regionObject.top = Math.max(0, regionObject.top - imageLocation.y)
            }
            const padding = userRegion.padding
            regions.push(regionWithUserInput({regionObject, userRegion, regionName, padding}))
          })
        }

        return regions
      }, [])
      allRegions[regionName] = regionValues
      return allRegions
    }, {})
  }
}

function regionify({region}) {
  const regionInst = new Region(region)
  return {
    width: regionInst.getWidth(),
    height: regionInst.getHeight(),
    left: regionInst.getLeft(),
    top: regionInst.getTop(),
  }
}

function regionWithUserInput({regionObject, userRegion, regionName, padding}) {
  // accesibility regions
  if (regionName === 'accessibility') {
    Object.assign(regionObject, {
      accessibilityType: userRegion.accessibilityType,
    })
  }
  // floating region
  if (regionName === 'floating') {
    Object.assign(regionObject, {
      maxUpOffset: userRegion.maxUpOffset,
      maxDownOffset: userRegion.maxDownOffset,
      maxLeftOffset: userRegion.maxLeftOffset,
      maxRightOffset: userRegion.maxRightOffset,
    })
  }
  return tempProxyToGeometryWithPadding(regionObject, padding)
}

module.exports = calculateSelectorsToFindRegionsFor
