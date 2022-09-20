function makeGetViewportSize({core}) {
  return function getViewportSize({driver, logger}) {
    return core.getViewportSize({target: driver, logger})
  }
}

module.exports = makeGetViewportSize
