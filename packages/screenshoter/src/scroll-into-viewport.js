const utils = require('@applitools/utils')

async function scrollIntoViewport({context, scroller, region, logger}) {
  if (context.driver.isNative) {
    logger.verbose(`NATIVE context identified, skipping 'ensure element visible'`)
    return
  }
  const elementContextRegion = region ? {...region} : await scroller.getClientRegion()
  const contextViewportLocation = await context.getLocationInViewport()
  const elementViewportRegion = utils.geometry.offset(elementContextRegion, contextViewportLocation)
  const viewportRegion = await context.main.getRegion()
  if (utils.geometry.contains(viewportRegion, elementViewportRegion)) return {x: 0, y: 0}

  let currentContext = context
  let remainingOffset = {x: elementContextRegion.x, y: elementContextRegion.y}
  while (currentContext) {
    const scrollingElement = await currentContext.getScrollingElement()
    const scrollingElementOffset = scrollingElement
      ? utils.geometry.location(await scrollingElement.getClientRegion())
      : {x: 0, y: 0}

    const actualOffset = await scroller.moveTo(
      utils.geometry.offsetNegative(remainingOffset, scrollingElementOffset),
      scrollingElement,
    )

    remainingOffset = utils.geometry.offset(
      utils.geometry.offsetNegative(remainingOffset, actualOffset),
      utils.geometry.location(await currentContext.getClientRegion()),
    )
    currentContext = currentContext.parent
  }
  return remainingOffset
}

module.exports = scrollIntoViewport
