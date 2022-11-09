const EYES_NAMESPACE = '__EYES__APPLITOOLS__'
const BROWSER_INFO_KEY = 'browserInfo'
window[EYES_NAMESPACE] = window[EYES_NAMESPACE] || {}

function getBrowserInfo() {
  try {
    if (window[EYES_NAMESPACE][BROWSER_INFO_KEY]) {
      const state = window[EYES_NAMESPACE][BROWSER_INFO_KEY]
      if (state.status !== 'WIP') delete window[EYES_NAMESPACE][BROWSER_INFO_KEY]
      return JSON.stringify(state)
    } else {
      const info = {
        userAgent: window.navigator.userAgent,
        pixelRatio: window.devicePixelRatio,
        viewportScale: window.visualViewport && window.visualViewport.scale,
      }
      if (window.navigator.userAgentData) {
        window[EYES_NAMESPACE][BROWSER_INFO_KEY] = {status: 'WIP'}
        window.navigator.userAgentData
          .getHighEntropyValues(['brands', 'platform', 'platformVersion', 'model'])
          .then(userAgentData => {
            info.userAgentData = userAgentData
            window[EYES_NAMESPACE][BROWSER_INFO_KEY] = {status: 'SUCCESS', value: info}
          })
          .catch(error => {
            window[EYES_NAMESPACE][BROWSER_INFO_KEY] = {status: 'ERROR', error: error.message}
          })
      } else {
        window[EYES_NAMESPACE][BROWSER_INFO_KEY] = {status: 'SUCCESS', value: info}
      }
      return JSON.stringify(window[EYES_NAMESPACE][BROWSER_INFO_KEY])
    }
  } catch (error) {
    window[EYES_NAMESPACE][BROWSER_INFO_KEY] = {status: 'ERROR', error: error.message}
    return JSON.stringify(window[EYES_NAMESPACE][BROWSER_INFO_KEY])
  }
}

module.exports = getBrowserInfo
