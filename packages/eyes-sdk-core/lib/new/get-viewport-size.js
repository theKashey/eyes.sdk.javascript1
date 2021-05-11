function makeGetViewportSize(sdk) {
  return function getViewportSize(driver, viewportSize) {
    return sdk.EyesFactory.getViewportSize(driver, viewportSize)
  }
}

module.exports = makeGetViewportSize
