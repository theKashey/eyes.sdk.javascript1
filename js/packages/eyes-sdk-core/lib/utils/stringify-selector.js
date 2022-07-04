function stringifySelector(element) {
  if (element && element.commonSelector) {
    return element.commonSelector.selector
  }
}

module.exports = stringifySelector
