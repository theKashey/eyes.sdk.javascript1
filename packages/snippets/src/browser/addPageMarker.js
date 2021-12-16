const setElementStyleProperties = require('./setElementStyleProperties')

function addPageMarker() {
  // bwb bwbb wbw bwbb wbww bbb
  const mask = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1]
  const colors = {1: 'rgb(0, 0, 0)', 0: 'rgb(255, 255, 255)'}
  const size = Math.max(1, window.innerWidth / screen.availWidth)
  const offset = 1

  const marker = document.createElement('div')
  marker.setAttribute('data-applitools-marker', '')
  marker.style.setProperty('position', 'fixed', 'important')
  marker.style.setProperty('top', '0', 'important')
  marker.style.setProperty('left', '0', 'important')
  marker.style.setProperty('box-sizing', 'content-box', 'important')
  marker.style.setProperty('padding', `${offset}px`, 'important')
  marker.style.setProperty('z-index', '2147483647', 'important')

  mask.forEach(color => {
    const item = document.createElement('div')
    item.style.setProperty('display', 'block', 'important')
    item.style.setProperty('float', 'left', 'important')
    item.style.setProperty('width', `${size}px`, 'important')
    item.style.setProperty('height', `1px`, 'important')
    item.style.setProperty('background', colors[color], 'important')
    marker.appendChild(item)
  })

  const transform = {value: 'none', important: true}
  const html = setElementStyleProperties([
    document.documentElement,
    {transform, '-webkit-transform': transform},
  ])
  const body = setElementStyleProperties([
    document.body,
    {transform, '-webkit-transform': transform},
  ])

  document.documentElement.setAttribute('data-applitools-original-transforms', JSON.stringify(html))
  document.body.setAttribute('data-applitools-original-transforms', JSON.stringify(body))
  document.body.appendChild(marker)

  return {mask, size, offset}
}

module.exports = addPageMarker
