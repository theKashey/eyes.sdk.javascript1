'use strict'
const {getTunnelAgentFromProxy} = require('@applitools/eyes-sdk-core/shared')
const utils = require('@applitools/utils')
const {getUserAgentForBrowser} = require('./getUserAgentForBrowser')

function getFetchOptions({url, referer, userAgent, proxySettings, browserName}) {
  const fetchOptions = {headers: {Referer: referer}}
  if (!utils.guard.isGoogleFont(url)) {
    fetchOptions.headers['User-Agent'] = userAgent
  } else {
    fetchOptions.headers['User-Agent'] = getUserAgentForBrowser(browserName)
  }

  if (proxySettings && proxySettings.getIsHttpOnly()) {
    fetchOptions.agent = getTunnelAgentFromProxy(proxySettings.toProxyObject())
  }
  return fetchOptions
}

module.exports = getFetchOptions
