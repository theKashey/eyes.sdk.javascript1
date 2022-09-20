function makeSetViewportSize({core}) {
  return function setViewportSize({driver, size, logger}) {
    return core.setViewportSize({target: driver, size, logger})
  }
}

module.exports = makeSetViewportSize
