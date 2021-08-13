const utils = require('@applitools/utils')
const makeTakeScreenshot = require('./take-screenshot')

async function takeViewportScreenshot({context, region, withStatusBar, wait, stabilization, debug = {}, logger}) {
  logger.verbose('Taking image of...')

  const driver = context.driver
  const takeScreenshot = makeTakeScreenshot({logger, driver, stabilization, debug})

  await utils.general.sleep(wait)

  const image = await takeScreenshot({withStatusBar})

  if (region) {
    const cropRegion = await driver.getRegionInViewport(context, region)
    if (utils.geometry.isEmpty(cropRegion)) throw new Error('Screenshot region is out of viewport')
    image.crop(cropRegion)
    await image.debug({path: debug.path, suffix: 'region'})
    return {image, region: cropRegion}
  } else {
    return {image, region: utils.geometry.region({x: 0, y: 0}, image.size)}
  }
}

module.exports = takeViewportScreenshot
