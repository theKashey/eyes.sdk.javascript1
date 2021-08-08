const utils = require('@applitools/utils')

async function calculateScreenshotRegions({context, screenshotRegion, regions}) {
  const screenshotRegions = []
  for (const region of regions) {
    screenshotRegions.push(await transformRegion(region))
  }

  return screenshotRegions

  async function transformRegion(region) {
    if (utils.types.has(region, ['x', 'y', 'width', 'height'])) {
      // if someday different coordinate systems will be supported (context or app based), the conversion will happen here
      return [regions]
    }
    const elements = await context.elements(region)
    return elements.reduce(async (regions, element) => {
      regions = await regions
      const region = await element.getRegion()
      regions.push({
        x: Math.max(0, region.x - screenshotRegion.x),
        y: Math.max(0, region.y - screenshotRegion.y),
        width: region.width,
        height: region.height,
      })
      return regions
    }, [])
  }
}

module.exports = calculateScreenshotRegions
