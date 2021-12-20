const setElementStyleProperties = require('./setElementStyleProperties')

function translateTo([element, offset] = []) {
  element = element || document.documentElement
  const transform = {value: `translate(${-offset.x}px, ${-offset.y}px)`, important: true}
  setElementStyleProperties([element, {transform, '-webkit-transform': transform}])
  return offset
}

module.exports = translateTo
