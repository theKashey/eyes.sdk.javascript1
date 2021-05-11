function makeSetViewportSize(sdk) {
  return function setViewportSize(driver, viewportSize) {
    return sdk.EyesFactory.setViewportSize(driver, viewportSize)
  }
}

module.exports = makeSetViewportSize
