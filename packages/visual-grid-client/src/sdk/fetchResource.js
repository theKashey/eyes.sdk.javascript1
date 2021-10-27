'use strict'
const retryFetch = require('@applitools/http-commons/src/retryFetch')
const createResourceCache = require('./createResourceCache')
const AbortController = require('abort-controller')
const utils = require('@applitools/utils')

function makeFetchResource({
  logger,
  retries = 5,
  fetchCache = createResourceCache(),
  fetch,
  mediaDownloadTimeout = 30 * 1000,
}) {
  return (url, opts, browserName) => {
    let keyToFetchFromCache = url
    if (utils.guard.isGoogleFont(url) && browserName) keyToFetchFromCache += `~` + browserName
    return (
      fetchCache.getValue(keyToFetchFromCache) ||
      fetchCache.setValue(keyToFetchFromCache, doFetchResource(url, opts))
    )
  }

  function doFetchResource(url, opts) {
    return retryFetch(
      async retry => {
        const retryStr = retry ? `(retry ${retry}/${retries})` : ''
        const optsStr = JSON.stringify(opts) || ''
        logger.verbose(`fetching ${url} ${retryStr} ${optsStr}`)

        const controller = new AbortController()
        const resp = await fetch(url, {...opts, signal: controller.signal})

        if (!resp.ok) {
          logger.verbose(`failed to fetch ${url} status ${resp.status}, returning errorStatusCode`)
          return {url, errorStatusCode: resp.status}
        }

        logger.verbose(`fetched ${url}`)

        const bufferPromise = resp.buffer ? resp.buffer() : resp.arrayBuffer()

        if (isProbablyStreaming(resp)) {
          return createStreamingPromise(resp, bufferPromise, controller)
        } else {
          const buffer = await bufferPromise
          return createResource(resp, buffer)
        }
      },
      {retries},
    )

    function createResource(resp, buffer) {
      return {
        url,
        type: resp.headers.get('Content-Type'),
        value: Buffer.from(buffer),
      }
    }

    function createStreamingPromise(resp, bufferPromise, controller) {
      return new Promise(async resolve => {
        const timeoutId = setTimeout(() => {
          logger.verbose('streaming timeout reached for resource', url)
          resolve({url, errorStatusCode: 599})
          controller.abort()
        }, mediaDownloadTimeout)

        // aborting the request causes node-fetch to reject bufferPromise, so we need to handle it
        try {
          const buffer = await bufferPromise
          resolve(createResource(resp, buffer))
        } catch (ex) {
          logger.verbose('streaming buffer exception', ex)
        } finally {
          clearTimeout(timeoutId)
        }
      })
    }

    function isProbablyStreaming(resp) {
      return (
        !resp.headers.get('Content-Length') &&
        ['audio/', 'video/'].some(prefix => resp.headers.get('Content-Type').startsWith(prefix))
      )
    }
  }
}

module.exports = makeFetchResource
