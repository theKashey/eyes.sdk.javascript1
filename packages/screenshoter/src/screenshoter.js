const utils = require('@applitools/utils')
const makeScroller = require('./scroller')
const takeStitchedScreenshot = require('./takeStitchedScreenshot')
const takeViewportScreenshot = require('./takeViewportScreenshot')
const scrollIntoViewport = require('./scrollIntoViewport')

async function screenshoter({
  logger,
  driver,
  frames = [],
  target,
  fully,
  hideScrollbars,
  hideCaret,
  scrollingMode,
  overlap,
  wait,
  dom,
  stabilization,
  debug,
  takeDomCapture,
}) {
  const originalContext = driver.currentContext
  const defaultScroller = makeScroller({logger, scrollingMode})

  const targetContext =
    frames.length > 0
      ? await originalContext.context(frames.reduce((parent, frame) => ({...frame, parent}), null))
      : originalContext
  const scrollingStates = []
  for (const nextContext of targetContext.path) {
    const scrollingElement = await nextContext.getScrollRootElement()
    if (hideScrollbars) await scrollingElement.hideScrollbars()
    const scrollingState = await defaultScroller.getState(scrollingElement)
    scrollingStates.push(scrollingState)
  }

  const activeElement = hideCaret && !driver.isNative ? await targetContext.blurElement() : null

  const {context, scroller, region} = await getTargetArea({
    logger,
    context: targetContext,
    target,
    fully,
    scrollingMode,
  })

  const scrollerState = await scroller.getState()

  await scrollIntoViewport({logger, context, scroller, region})

  try {
    const screenshot = fully
      ? await takeStitchedScreenshot({
          logger,
          context,
          scroller,
          region,
          overlap,
          wait,
          stabilization,
          debug,
        })
      : await takeViewportScreenshot({logger, context, region, wait, stabilization, debug})

    if (!dom) return screenshot

    // temporary solution
    if (fully) {
      await context.execute(
        'arguments[0].setAttribute("data-applitools-scroll", "true")',
        scroller.element,
      )
    }

    return {...screenshot, dom: await takeDomCapture()}
    // ---
  } finally {
    await scroller.restoreState(scrollerState)

    if (hideCaret && activeElement) await targetContext.focusElement(activeElement)

    for (const prevContext of targetContext.path.reverse()) {
      const scrollingElement = await prevContext.getScrollRootElement()
      if (hideScrollbars) await scrollingElement.restoreScrollbars()
      const scrollingState = scrollingStates.shift()
      await defaultScroller.restoreState(scrollingState, scrollingElement)
    }

    await originalContext.focus()
  }
}

async function getTargetArea({logger, context, target, fully, scrollingMode}) {
  if (target) {
    if (utils.types.has(target, ['x', 'y', 'width', 'height'])) {
      const scrollingElement = await context.getScrollRootElement()
      return {
        context,
        region: target,
        scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
      }
    } else {
      const element = await context.element(target)
      if (!element) throw new Error('Element not found!')

      if (fully) {
        const isScrollable = await element.isScrollable()
        const scrollingElement = isScrollable ? element : await context.getScrollRootElement()
        return {
          context,
          region: isScrollable ? null : await element.getRect(),
          scroller: makeScroller({
            logger,
            element: scrollingElement,
            scrollingMode: isScrollable && scrollingMode === 'css' ? 'mixed' : scrollingMode,
          }),
        }
      } else {
        const scrollingElement = await context.getScrollRootElement()
        return {
          context,
          region: await element.getRect(),
          scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
        }
      }
    }
  } else if (!context.isMain && !fully) {
    const scrollingElement = await context.parent.getScrollRootElement()
    const element = await context.getFrameElement()
    return {
      context: context.parent,
      region: await element.getClientRect(),
      scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
    }
  } else {
    const scrollingElement = await context.getScrollRootElement()
    return {
      context,
      scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
    }
  }
}

module.exports = screenshoter
