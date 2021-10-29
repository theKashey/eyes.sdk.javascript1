'use strict'
const {getTunnelAgentFromProxy} = require('@applitools/eyes-sdk-core/shared')
const {getUserAgentForBrowser} = require('./getUserAgentForBrowser')

function getFetchOptions({rGridResource, referer, userAgent, proxySettings}) {
  const fetchOptions = {headers: {Referer: referer}}
  if (!rGridResource.isGoogleFont()) {
    fetchOptions.headers['User-Agent'] = userAgent
  } else {
    fetchOptions.headers['User-Agent'] = getUserAgentForBrowser(rGridResource.getBrowserName())
  }

  if (proxySettings && proxySettings.getIsHttpOnly()) {
    fetchOptions.agent = getTunnelAgentFromProxy(proxySettings.toProxyObject())
  }
  return fetchOptions
}

module.exports = getFetchOptions
