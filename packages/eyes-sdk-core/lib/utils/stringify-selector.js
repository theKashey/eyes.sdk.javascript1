function stringifySelector(element) {
  if (element && element.commonSelector && element.commonSelector.type && element.commonSelector.selector)
    return `${element.commonSelector.type}:${element.commonSelector.selector}`
}

module.exports = stringifySelector
