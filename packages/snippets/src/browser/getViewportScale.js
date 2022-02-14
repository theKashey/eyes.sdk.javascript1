function getViewportScale() {
  return window.visualViewport && window.visualViewport.scale
}

module.exports = getViewportScale
