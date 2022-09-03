const utils = require('@applitools/utils')

async function extractCoodinatesForSelectorsAndElements({regionsToCalculate, screenshot, context}) {
  const codedRegionsByCoordinates = []
  for (const codedRegion of regionsToCalculate) {
    if (codedRegion) {
      const {region} = codedRegion.region ? codedRegion : {region: codedRegion}
      const elements = await context.elements(region)
      if (elements.length > 0) {
        const contextLocationInViewport = await elements[0].context.getLocationInViewport()
        const scaledRegions = []
        for (const element of elements) {
          const elementRegion = await element.getRegion()
          const region = utils.geometry.offset(elementRegion, contextLocationInViewport)
          const scaledRegion = utils.geometry.scale(
            {
              x: Math.max(0, region.x - screenshot.region.x),
              y: Math.max(0, region.y - screenshot.region.y),
              width: region.width,
              height: region.height,
            },
            context.driver.viewportScale,
          )
          scaledRegions.push({region: scaledRegion})
        }
        codedRegionsByCoordinates.push({regions: scaledRegions, commonSelector: elements[0].commonSelector})
      } else {
        codedRegionsByCoordinates.push({regions: []})
      }
    }
  }
  return codedRegionsByCoordinates
}

module.exports = extractCoodinatesForSelectorsAndElements
