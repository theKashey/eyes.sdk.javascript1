const utils = require('@applitools/utils')
const snippets = require('@applitools/snippets')
const findImagePattern = require('./find-image-pattern')
const makeImage = require('./image')

function makeTakeScreenshot(options) {
  const {driver} = options
  if (driver.isNative) {
    return makeTakeNativeScreenshot(options)
  } else if (driver.browserName === 'Firefox') {
    try {
      const browserVersion = Number.parseInt(driver.browserVersion, 10)
      if (browserVersion >= 48 && browserVersion <= 72) {
        return makeTakeMainContextScreenshot(options)
      }
    } catch (ignored) {}
  } else if (driver.browserName === 'Safari') {
    if (driver.isIOS) {
      return makeTakeMarkedScreenshot(options)
    } else if (driver.browserVersion === '11') {
      return makeTakeSafari11Screenshot(options)
    }
  }

  return makeTakeDefaultScreenshot(options)
}

function makeTakeDefaultScreenshot({driver, stabilization = {}, debug, logger}) {
  const calculateScaleRatio = makeCalculateScaleRatio({driver})
  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking screenshot...')
    const image = makeImage(await driver.takeScreenshot())
    await image.debug({...debug, name, suffix: 'original'})

    if (stabilization.scale) image.scale(stabilization.scale)
    else image.scale(await calculateScaleRatio(image.width))

    if (stabilization.rotate) image.crop(stabilization.rotate)

    if (stabilization.crop) image.crop(stabilization.crop)

    return image
  }
}

function makeTakeMainContextScreenshot({driver, stabilization = {}, debug, logger}) {
  const calculateScaleRatio = makeCalculateScaleRatio({driver})
  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking screenshot...')
    const originalContext = driver.currentContext
    await driver.mainContext.focus()
    const image = makeImage(await driver.takeScreenshot())
    await originalContext.focus()
    await image.debug({...debug, name, suffix: 'original'})

    if (stabilization.scale) image.scale(stabilization.scale)
    else image.scale(await calculateScaleRatio(image.width))

    if (stabilization.rotate) image.rotate(stabilization.rotate)

    if (stabilization.crop) image.crop(stabilization.crop)

    return image
  }
}

function makeTakeSafari11Screenshot({driver, stabilization = {}, debug, logger}) {
  const calculateScaleRatio = makeCalculateScaleRatio({driver})
  let viewportSize

  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking safari 11 driver screenshot...')
    const image = makeImage(await driver.takeScreenshot())
    await image.debug({...debug, name, suffix: 'original'})

    if (stabilization.scale) image.scale(stabilization.scale)
    else image.scale(await calculateScaleRatio(image.width))

    if (stabilization.rotate) image.rotate(stabilization.rotate)

    if (stabilization.crop) image.crop(stabilization.crop)
    else {
      if (!viewportSize) viewportSize = await driver.getViewportSize()
      const viewportLocation = await driver.mainContext.execute(snippets.getElementScrollOffset, [])
      image.crop(utils.geometry.region(viewportLocation, viewportSize))
    }

    return image
  }
}

function makeTakeMarkedScreenshot({driver, stabilization = {}, debug, logger}) {
  const calculateScaleRatio = makeCalculateScaleRatio({driver})
  let viewportRegion

  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking viewport screenshot (using markers)...')
    const image = makeImage(await driver.takeScreenshot())
    await image.debug({...debug, name, suffix: 'original'})

    if (stabilization.scale) image.scale(stabilization.scale)
    else image.scale(await calculateScaleRatio(image.width))

    if (stabilization.rotate) image.rotate(stabilization.rotate)

    if (stabilization.crop) image.crop(stabilization.crop)
    else {
      if (!viewportRegion) viewportRegion = await getViewportRegion()
      image.crop(viewportRegion)
    }

    return image
  }

  async function getViewportRegion() {
    const marker = await driver.mainContext.execute(snippets.addPageMarker)
    try {
      const image = makeImage(await driver.takeScreenshot())

      if (stabilization.rotate) await image.rotate(stabilization.rotate)

      await image.debug({...debug, name: 'marker'})

      const markerLocation = findImagePattern(await image.toObject(), marker)
      if (!markerLocation) return null

      const viewportSize = await driver.getViewportSize()

      return utils.geometry.region(utils.geometry.scale(markerLocation, 1 / driver.pixelRatio), viewportSize)
    } finally {
      await driver.mainContext.execute(snippets.cleanupPageMarker)
    }
  }
}

function makeTakeNativeScreenshot({driver, stabilization = {}, debug, logger}) {
  return async function takeScreenshot({name, withStatusBar} = {}) {
    logger.verbose('Taking native driver screenshot...')
    const image = makeImage(await driver.takeScreenshot())
    await image.debug({...debug, name, suffix: 'original'})

    if (stabilization.scale) image.scale(stabilization.scale)
    else image.scale(1 / driver.pixelRatio)

    if (stabilization.rotate) image.rotate(stabilization.rotate)

    if (stabilization.crop) image.crop(stabilization.crop)
    else {
      const viewportSize = await driver.getViewportSize()
      const cropRegion = withStatusBar
        ? {x: 0, y: 0, width: viewportSize.width, height: viewportSize.height + driver.statusBarHeight}
        : {x: 0, y: driver.statusBarHeight, width: viewportSize.width, height: viewportSize.height}
      image.crop(cropRegion)
      await image.debug({...debug, name, suffix: `viewport${withStatusBar ? '-with-statusbar' : ''}`})
    }

    return image
  }
}

function makeCalculateScaleRatio({driver}) {
  let viewportWidth, contentWidth
  const VIEWPORT_THRESHOLD = 1
  const CONTENT_THRESHOLD = 10
  return async function calculateScaleRatio(imageWidth) {
    if (!viewportWidth) viewportWidth = await driver.getViewportSize().then(size => size.width)
    if (!contentWidth) contentWidth = await driver.mainContext.getContentSize().then(size => size.width)
    // If the image's width is the same as the viewport's width or the
    // top level context's width, no scaling is necessary.
    if (
      (imageWidth >= viewportWidth - VIEWPORT_THRESHOLD && imageWidth <= viewportWidth + VIEWPORT_THRESHOLD) ||
      (imageWidth >= contentWidth - CONTENT_THRESHOLD && imageWidth <= contentWidth + CONTENT_THRESHOLD)
    ) {
      return 1
    }

    const scaledImageWidth = Math.round(imageWidth / driver.pixelRatio)
    return viewportWidth / scaledImageWidth / driver.pixelRatio
  }
}

module.exports = makeTakeScreenshot
