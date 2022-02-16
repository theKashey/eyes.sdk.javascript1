const utils = require('@applitools/utils')
const makeImage = require('./image')
const makeTakeViewportScreenshot = require('./take-viewport-screenshot')

async function takeStitchedScreenshot({
  logger,
  context,
  scroller,
  region,
  withStatusBar,
  overlap = {top: 10, bottom: 50},
  framed,
  wait,
  stabilization,
  debug,
}) {
  logger.verbose('Taking full image of...')

  const driver = context.driver
  const takeViewportScreenshot = makeTakeViewportScreenshot({logger, driver, stabilization, debug})
  const scrollerState = await scroller.preserveState()

  const initialOffset = region ? utils.geometry.location(region) : {x: 0, y: 0}
  const actualOffset = await scroller.getInnerOffset()
  const expectedRemainingOffset = utils.geometry.offsetNegative(initialOffset, actualOffset)

  await utils.general.sleep(wait)

  const contentSize = await scroller.getContentSize()

  logger.verbose('Getting initial image...')
  let image = await takeViewportScreenshot({name: 'initial', withStatusBar})
  const firstImage = framed ? makeImage(image) : null

  const scrollerRegion = await scroller.getClientRegion()
  const targetRegion = region
    ? utils.geometry.intersect(utils.geometry.region(actualOffset, scrollerRegion), region)
    : scrollerRegion

  // TODO the solution should not check driver specifics,
  // in this case target region coordinate should be already related to the scrolling element of the context
  let cropRegion = driver.isNative ? targetRegion : await driver.getRegionInViewport(context, targetRegion)

  logger.verbose('cropping...')
  image.crop(withStatusBar ? utils.geometry.offset(cropRegion, {x: 0, y: driver.statusBarHeight}) : cropRegion)
  await image.debug({...debug, name: 'initial', suffix: 'region'})

  const contentRegion = utils.geometry.region({x: 0, y: 0}, contentSize)
  logger.verbose(`Scroller size: ${contentRegion}`)

  if (region) region = utils.geometry.intersect(region, contentRegion)
  else region = contentRegion

  region = utils.geometry.round(region)

  const [initialRegion, ...partRegions] = utils.geometry.divide(region, image.size, overlap)
  logger.verbose('Part regions', partRegions)

  logger.verbose('Creating stitched image composition container')
  const stitchedImage = makeImage({auto: true})

  logger.verbose('Adding initial image...')
  stitchedImage.copy(image, {x: 0, y: 0})

  logger.verbose('Getting the rest of the image parts...')

  let lastImage = firstImage
  let scrollerRegionShift = {x: 0, y: 0}
  for (const partRegion of partRegions) {
    const partName = `${partRegion.x}_${partRegion.y}_${partRegion.width}x${partRegion.height}`
    logger.verbose(`Processing part ${partName}`)

    const compensateOffset = {x: 0, y: initialRegion.y !== partRegion.y ? overlap.top : 0}
    const requiredOffset = utils.geometry.offsetNegative(utils.geometry.location(partRegion), compensateOffset)

    logger.verbose(`Move to ${requiredOffset}`)
    let actualOffset = await scroller.moveTo(requiredOffset)
    // actual scroll position after scrolling might be not equal to required position due to
    // scrollable region shift during scrolling so actual scroll position should be corrected
    if (!utils.geometry.equals(actualOffset, requiredOffset) && driver.isNative) {
      const actualScrollerRegion = await scroller.getClientRegion()
      scrollerRegionShift = {x: scrollerRegion.x - actualScrollerRegion.x, y: scrollerRegion.y - actualScrollerRegion.y}
    }
    actualOffset = utils.geometry.offset(actualOffset, scrollerRegionShift)

    const remainingOffset = {
      x: requiredOffset.x - actualOffset.x - expectedRemainingOffset.x + compensateOffset.x,
      y: requiredOffset.y - actualOffset.y - expectedRemainingOffset.y + compensateOffset.y,
    }

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
    image = await takeViewportScreenshot({name: partName})
    lastImage = framed ? makeImage(image) : null

    logger.verbose('cropping...')
    image.crop(cropPartRegion)
    await image.debug({...debug, name: partName, suffix: 'region'})

    const pasteOffset = utils.geometry.offsetNegative(utils.geometry.location(partRegion), initialOffset)
    stitchedImage.copy(image, pasteOffset)
  }

  await scroller.restoreState(scrollerState)

  await stitchedImage.debug({...debug, name: 'stitched'})

  if (framed) {
    stitchedImage.frame(
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
