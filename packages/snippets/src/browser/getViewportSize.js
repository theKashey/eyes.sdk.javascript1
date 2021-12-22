function getViewportSize() {
  let width = 0
  let height = 0
  if (window.innerHeight) {
    height = window.innerHeight
  } else if (document.documentElement && document.documentElement.clientHeight) {
    height = document.documentElement.clientHeight
  } else if (document.body && document.body.clientHeight) {
    height = document.body.clientHeight
  }
  if (window.innerWidth) {
    width = window.innerWidth
  } else if (document.documentElement && document.documentElement.clientWidth) {
    width = document.documentElement.clientWidth
  } else if (document.body && document.body.clientWidth) {
    width = document.body.clientWidth
  }

  if (window.visualViewport) {
    width = Math.round(width * window.visualViewport.scale)
    height = Math.round(height * window.visualViewport.scale)
  }

  return {width, height}
}

module.exports = getViewportSize
