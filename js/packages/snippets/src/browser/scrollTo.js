const setElementStyleProperties = require('./setElementStyleProperties')

function scrollTo([element, offset] = []) {
  element = element || document.documentElement

  const originalStyleProperties = setElementStyleProperties([
    element,
    {'scroll-behavior': {value: 'auto', important: true}},
  ])

  if (element.scrollTo) {
    element.scrollTo(offset.x, offset.y)
  } else {
    element.scrollLeft = offset.x
    element.scrollTop = offset.y
  }

  setElementStyleProperties([element, originalStyleProperties])

  return {x: element.scrollLeft, y: element.scrollTop}
}

module.exports = scrollTo
