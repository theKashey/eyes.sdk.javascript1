const setElementStyleProperties = require('./setElementStyleProperties')
const getDocumentScrollingElement = require('./getDocumentScrollingElement')

function getElementEntireSize([element] = []) {
  let originalStyleProperties
  if (
    element === document.documentElement ||
    element.tagName.toLowerCase() === getDocumentScrollingElement()
  ) {
    originalStyleProperties = setElementStyleProperties([element, {transform: 'none'}])
  }

  const size = {width: element.scrollWidth, height: element.scrollHeight}

  if (originalStyleProperties) {
    setElementStyleProperties([element, originalStyleProperties])
  }
  return size
}

module.exports = getElementEntireSize
