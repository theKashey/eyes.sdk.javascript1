const utils = require('@applitools/utils')
const makeScroller = require('./scroller')
const scrollIntoViewport = require('./scroll-into-viewport')
const takeStitchedScreenshot = require('./take-stitched-screenshot')
const takeSimpleScreenshot = require('./take-simple-screenshot')

async function takeScreenshot({
  driver,
  frames = [],
  region,
  fully,
  scrollingMode,
  hideScrollbars,
  hideCaret,
  withStatusBar,
  overlap,
  framed,
  wait,
  stabilization,
  hooks,
  debug,
  logger,
}) {
  // screenshot of a window/app was requested (fully or viewport)
  const window = !region && (!frames || frames.length === 0)
  // framed screenshots could be taken only when screenshot of window/app fully was requested
  framed = framed && fully && window
  // screenshots with status bar could be taken only when screenshot of app or framed app fully was requested
  withStatusBar = withStatusBar && driver.isNative && window && (!fully || framed)
  scrollingMode = driver.isNative ? 'scroll' : scrollingMode

  const activeContext = driver.currentContext
  const context =
    frames.length > 0
      ? await activeContext.context(frames.reduce((parent, frame) => ({...frame, parent}), null))
      : activeContext

  // traverse from main context to target context to hide scrollbars and preserve context state (scroll/translate position)
  for (const nextContext of context.path) {
    const scrollingElement = await nextContext.getScrollingElement()
    // unlike web apps, native apps do not always have scrolling element
    if (scrollingElement) {
      if (driver.isWeb && hideScrollbars) await scrollingElement.hideScrollbars()
      await scrollingElement.preserveState()
    }
  }

  // blur active element in target context
  const activeElement = driver.isWeb && hideCaret ? await context.blurElement() : null

  const target = await getTarget({window, context, region, fully, scrollingMode, logger})

  if (driver.isWeb && hideScrollbars) await target.scroller.hideScrollbars()

  try {
    if (!window) await scrollIntoViewport({...target, logger})

    const screenshot =
      fully && target.scroller
        ? await takeStitchedScreenshot({...target, withStatusBar, overlap, framed, wait, stabilization, debug, logger})
        : await takeSimpleScreenshot({...target, withStatusBar, wait, stabilization, debug, logger})

    screenshot.image.scale(driver.viewportScale)

    if (hooks && hooks.afterScreenshot) {
      // imitate image-like state for the hook
      if (window && fully && target.scroller) {
        await target.scroller.moveTo({x: 0, y: 0}, await driver.mainContext.getScrollingElement())
      }
      await hooks.afterScreenshot({driver, scroller: target.scroller, screenshot})
    }

    return screenshot
  } finally {
    if (target.scroller) {
      await target.scroller.restoreScrollbars()
    }

    // if there was active element and we have blurred it, then restore focus
    if (activeElement) await context.focusElement(activeElement)

    // traverse from target context to the main context to restore scrollbars and context states
    for (const prevContext of context.path.reverse()) {
      const scrollingElement = await prevContext.getScrollingElement()
      if (scrollingElement) {
        if (driver.isWeb && hideScrollbars) await scrollingElement.restoreScrollbars()
        await scrollingElement.restoreState()
      }
    }

    // restore focus on original active context
    await activeContext.focus()
  }
}

async function getTarget({window, context, region, fully, scrollingMode, logger}) {
  if (window) {
    // window/app
    const scrollingElement = await context.main.getScrollingElement()
    return {
      context: context.main,
      scroller: scrollingElement ? makeScroller({element: scrollingElement, scrollingMode, logger}) : null,
    }
  } else if (region) {
    if (utils.types.has(region, ['x', 'y', 'width', 'height'])) {
      // region by coordinates
      const scrollingElement = await context.getScrollingElement()
      return {
        context,
        region,
        scroller: scrollingElement ? makeScroller({element: scrollingElement, scrollingMode, logger}) : null,
      }
    } else {
      // region by element or selector
      const element = await context.element(region)
      if (!element) throw new Error('Element not found!')

      const elementContext = element.context

      if (fully) {
        const isScrollable = await element.isScrollable()
        // if element is scrollable, then take screenshot of the full element content, otherwise take screenshot of full element
        const region = isScrollable ? null : await element.getRegion()
        const scrollingElement = isScrollable ? element : await elementContext.getScrollingElement()
        // css stitching could be applied only to root element of its context
        scrollingMode = scrollingMode === 'css' && !(await scrollingElement.isRoot()) ? 'mixed' : scrollingMode
        return {
          context: elementContext,
          region,
          scroller: scrollingElement ? makeScroller({element: scrollingElement, scrollingMode, logger}) : null,
        }
      } else {
        const scrollingElement = await context.getScrollingElement()
        return {
          context: elementContext,
          region: await element.getRegion(),
          scroller: scrollingElement ? makeScroller({element: scrollingElement, scrollingMode, logger}) : null,
        }
      }
    }
  } else if (!context.isMain) {
    // context
    if (fully) {
      const scrollingElement = await context.getScrollingElement()
      return {
        context,
        scroller: scrollingElement ? makeScroller({logger, element: scrollingElement, scrollingMode}) : null,
      }
    } else {
      const scrollingElement = await context.parent.getScrollingElement()
      const element = await context.getContextElement()
      return {
        context: context.parent,
        region: await element.getRegion(), // IMHO we should use CLIENT (without borders) region here
        scroller: scrollingElement ? makeScroller({logger, element: scrollingElement, scrollingMode}) : null,
      }
    }
  }
}

module.exports = takeScreenshot
