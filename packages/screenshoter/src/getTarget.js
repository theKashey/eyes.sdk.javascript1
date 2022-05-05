const utils = require('@applitools/utils')

async function getTarget({window, context, region, fully, scrollingMode}) {
  if (window) {
    // window/app
    const scrollingElement = await context.main.getScrollingElement()
    return {
      context: context.main,
      scrollingElement,
    }
  } else if (region) {
    if (utils.types.has(region, ['x', 'y', 'width', 'height'])) {
      // region by coordinates
      const scrollingElement = await context.getScrollingElement()
      return {
        context,
        region,
        scrollingElement,
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
        scrollingMode = scrollingMode === 'css' && !(await scrollingElement.isRoot()) ? 'mixed+' : scrollingMode
        return {
          context: elementContext,
          region,
          scrollingMode,
          scrollingElement,
        }
      } else {
        const scrollingElement = await context.getScrollingElement()
        return {
          context: elementContext,
          region: await element.getRegion(),
          scrollingElement,
        }
      }
    }
  } else if (!context.isMain) {
    // context
    if (fully) {
      const scrollingElement = await context.getScrollingElement()
      return {
        context,
        scrollingElement,
      }
    } else {
      const scrollingElement = await context.parent.getScrollingElement()
      const element = await context.getContextElement()
      return {
        context: context.parent,
        region: await element.getRegion(), // IMHO we should use CLIENT (without borders) region here
        scrollingElement,
      }
    }
  }
}
module.exports = getTarget
