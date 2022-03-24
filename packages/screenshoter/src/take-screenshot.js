const scrollIntoViewport = require('./scroll-into-viewport')
const getTarget = require('./getTarget')
const makeScroller = require('./scroller')
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

  const target = await getTarget({window, context, region, fully, scrollingMode})
  // in some cases getTarget logic manipulates the 'scrollingMode'
  scrollingMode = target.scrollingMode || scrollingMode

  const scroller = target.scrollingElement
    ? makeScroller({element: target.scrollingElement, scrollingMode, logger})
    : null

  if (scroller) {
    await scroller.preserveState()
    if (driver.isWeb && hideScrollbars) await scroller.hideScrollbars()
  }

  try {
    if (!window) await scrollIntoViewport({context: target.context, region: target.region, scroller, logger})

    const screenshot =
      fully && scroller
        ? await takeStitchedScreenshot({
            ...target,
            scroller,
            withStatusBar,
            overlap,
            framed,
            wait,
            stabilization,
            debug,
            logger,
          })
        : await takeSimpleScreenshot({...target, scroller, withStatusBar, wait, stabilization, debug, logger})

    screenshot.image.scale(driver.viewportScale)

    if (hooks && hooks.afterScreenshot) {
      await hooks.afterScreenshot({driver, scroller, screenshot})
    }

    return screenshot
  } finally {
    if (scroller) {
      await scroller.restoreScrollbars()
      await scroller.restoreState()
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

module.exports = takeScreenshot
