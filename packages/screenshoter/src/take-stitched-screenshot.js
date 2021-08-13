const utils = require('@applitools/utils')
const makeImage = require('./image')
const makeTakeScreenshot = require('./take-screenshot')

async function takeStitchedScreenshot({
  logger,
  context,
  scroller,
  region,
  withStatusBar,
  overlap = 50,
  framed,
  wait,
  stabilization,
  debug,
}) {
  logger.verbose('Taking full image of...')

  const driver = context.driver
  const takeScreenshot = makeTakeScreenshot({logger, driver, stabilization, debug})
  const scrollerState = await scroller.preserveState()

  const initialOffset = region ? utils.geometry.location(region) : {x: 0, y: 0}
  const actualOffset = await scroller.moveTo(initialOffset)
  const expectedRemainingOffset = utils.geometry.offsetNegative(initialOffset, actualOffset)

  await utils.general.sleep(wait)

  logger.verbose('Getting initial image...')
  let image = await takeScreenshot({name: 'initial', withStatusBar})
  const firstImage = framed ? makeImage(image) : null

  const targetRegion = region
    ? utils.geometry.intersect(
        utils.geometry.region(await scroller.getInnerOffset(), await scroller.getClientRegion()),
        region,
      )
    : await scroller.getClientRegion()

  // TODO the solution should not check driver specifics,
  // in this case target region coordinate should be already related to the scrolling element of the context
  const cropRegion = driver.isNative ? targetRegion : await driver.getRegionInViewport(context, targetRegion)

  logger.verbose('cropping...')
  image.crop(withStatusBar ? utils.geometry.offset(cropRegion, {x: 0, y: driver.statusBarHeight}) : cropRegion)
  await image.debug({...debug, name: 'initial', suffix: 'region'})

  const contentRegion = utils.geometry.region({x: 0, y: 0}, await scroller.getContentSize())
  logger.verbose(`Scroller size: ${contentRegion}`)

  if (region) region = utils.geometry.intersect(region, contentRegion)
  else region = contentRegion

  region = utils.geometry.round(region)

  // TODO padding should be provided from args instead of overlap
  const padding = {top: overlap, bottom: overlap}
  const [initialRegion, ...partRegions] = utils.geometry.divide(region, image.size, padding)
  logger.verbose('Part regions', partRegions)

  logger.verbose('Creating stitched image composition container')
  const stitchedImage = makeImage({width: region.width, height: region.height})

  logger.verbose('Adding initial image...')
  await stitchedImage.copy(image, {x: 0, y: 0})

  logger.verbose('Getting the rest of the image parts...')

  let stitchedSize = {width: image.width, height: image.height}
  let lastImage
  for (const partRegion of partRegions) {
    const partName = `${partRegion.x}_${partRegion.y}_${partRegion.width}x${partRegion.height}`
    logger.verbose(`Processing part ${partName}`)

    const compensateOffset = {x: 0, y: initialRegion.y !== partRegion.y ? padding.top : 0}
    const requiredOffset = utils.geometry.offsetNegative(utils.geometry.location(partRegion), compensateOffset)

    logger.verbose(`Move to ${requiredOffset}`)
    const actualOffset = await scroller.moveTo(requiredOffset)
    const remainingOffset = utils.geometry.offset(
      utils.geometry.offsetNegative(
        utils.geometry.offsetNegative(requiredOffset, actualOffset),
        expectedRemainingOffset,
      ),
      compensateOffset,
    )
    const cropPartRegion = {
      x: cropRegion.x + remainingOffset.x,
      y: cropRegion.y + remainingOffset.y,
      width: partRegion.width,
      height: partRegion.height,
    }
    logger.verbose(`Actual offset is ${actualOffset}, remaining offset is ${remainingOffset}`)

    await utils.general.sleep(wait)

    if (utils.geometry.isEmpty(cropPartRegion) || !utils.geometry.isIntersected(cropRegion, cropPartRegion)) continue

    logger.verbose('Getting image...')
    image = await takeScreenshot({name: partName})
    lastImage = framed ? makeImage(image) : null

    logger.verbose('cropping...')
    image.crop(cropPartRegion)
    await image.debug({...debug, name: partName, suffix: 'region'})

    const pasteOffset = utils.geometry.offsetNegative(utils.geometry.location(partRegion), initialOffset)
    await stitchedImage.copy(image, pasteOffset)

    stitchedSize = {width: pasteOffset.x + image.width, height: pasteOffset.y + image.height}
  }

  await scroller.restoreState(scrollerState)

  logger.verbose(`Extracted entire size: ${region}`)
  logger.verbose(`Actual stitched size: ${stitchedSize}`)

  if (stitchedSize.width < stitchedImage.width || stitchedSize.height < stitchedImage.height) {
    logger.verbose('Trimming unnecessary margins...')
    stitchedImage.crop(utils.geometry.region({x: 0, y: 0}, stitchedSize))
  }

  await stitchedImage.debug({...debug, name: 'stitched'})

  if (framed) {
    await stitchedImage.combine(
      firstImage,
      lastImage,
      withStatusBar ? utils.geometry.offset(cropRegion, {x: 0, y: driver.statusBarHeight}) : cropRegion,
    )
    await stitchedImage.debug({...debug, name: 'framed'})

    return {
      image: stitchedImage,
      region: utils.geometry.region({x: 0, y: 0}, stitchedImage.size),
    }
  } else {
    return {
      image: stitchedImage,
      region: utils.geometry.region(cropRegion, stitchedImage.size),
    }
  }
}

module.exports = takeStitchedScreenshot
