'use strict'

function getBrowserKeyForUserAgent(browserName) {
  if (!browserName) return ''
  if (browserName === 'ie10' || browserName === 'ie11') return 'IE'
  else if (browserName.includes('chrome')) return 'Chrome'
  else if (browserName.includes('firefox')) return 'Firefox'
  else if (browserName.includes('safari')) return 'Safari'
  else if (browserName.includes('edgechromium')) return 'Edgechromium'
  else if (browserName.includes('edge')) return 'Edge'
}

module.exports = getBrowserKeyForUserAgent
