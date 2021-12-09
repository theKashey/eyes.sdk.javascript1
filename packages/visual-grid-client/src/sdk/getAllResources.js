'use strict'
const mapValues = require('lodash.mapvalues')
const mapKeys = require('lodash.mapkeys')
const {RGridResource} = require('@applitools/eyes-sdk-core/shared')
const absolutizeUrl = require('./absolutizeUrl')
const resourceType = require('./resourceType')
const toCacheEntry = require('./toCacheEntry')
const extractSvgResources = require('./extractSvgResources')
const getFetchOptions = require('./getFetchOptions')
const getResourceCookies = require('./getResourceCookies')

// NOTE regarding support for errorStatusCode:
// why is this function still valid? because it is meant to add resources to the return value of getAllResources, if and only if it's not already there OR it is there but there is no content (for some reason I don't remember).
// when handling errorStatusCode resources, they are added if they are not already there, and if they are there, they will never have content so it's fine.
function assignContentfulResources(obj1, obj2) {
  for (const p in obj2) {
    if (!obj1[p] || !obj1[p].getContent()) {
      obj1[p] = obj2[p]
    }
  }
}

function fromCacheToRGridResource({url, type, hash, content, errorStatusCode}) {
  const resource = new RGridResource({url})
  if (errorStatusCode) {
    resource.setErrorStatusCode(errorStatusCode)
  } else {
    resource.setContentType(type)
    resource.setContent(content || '')
    // yuck! but RGridResource assumes it always has the content, which we prefer not to save in cache.
    // after renderBatch we clear the content of the resource, for saving space.
    resource._sha256hash = hash
  }
  return resource
}

function makeGetAllResources({resourceCache, fetchResource, extractCssResources, logger}) {
  function fromFetchedToRGridResource({url, type, value, errorStatusCode}) {
    const rGridResource = new RGridResource({url})
    if (errorStatusCode) {
      rGridResource.setErrorStatusCode(errorStatusCode)
    } else {
      rGridResource.setContentType(type || 'application/x-applitools-unknown') // TODO test this
      rGridResource.setContent(value || '')
      if (!value) {
        logger.log(`warning! the resource ${url} ${type} has no content.`)
      }
    }
    return rGridResource
  }

  return function getAllResources({
    resourceUrls,
    preResources,
    userAgent,
    referer,
    proxySettings,
    browserName,
    cookies,
  }) {
    const handledResourceUrls = new Set()
    return getOrFetchResources(resourceUrls, preResources)

    async function getOrFetchResources(resourceUrls = [], preResources = {}) {
      const rGridResources = resourceUrls.map(url => new RGridResource({url, browserName}))
      const resources = {}
      for (const [url, resource] of Object.entries(preResources)) {
        // "preResources" are not fetched and not in "fetchCache" so cache them to "resourceCache".
        const rGridResource = fromFetchedToRGridResource(resource)
        resourceCache.setValue(rGridResource.getCacheKey(), toCacheEntry(rGridResource))
        if (resource.dependencies) {
          resourceCache.setDependencies(rGridResource.getCacheKey(), resource.dependencies)
        }
        handledResourceUrls.add(url)
        assignContentfulResources(resources, {[url]: rGridResource})
      }

      const unhandledResources = rGridResources.filter(
        rGridResource => !handledResourceUrls.has(rGridResource.getUrl()),
      )
      const missingResources = []
      for (const rGridResource of unhandledResources) {
        handledResourceUrls.add(rGridResource.getUrl())
        const cacheEntry = resourceCache.getWithDependencies(rGridResource.getCacheKey())
        if (cacheEntry) {
          assignContentfulResources(
            resources,
            mapKeys(mapValues(cacheEntry, fromCacheToRGridResource), value => value.getUrl()),
          )
          const cacheEntryKeys = Object.keys(cacheEntry)
          logger.log(
            `resource retrieved from cache, with dependencies (${
              cacheEntryKeys.length
            }): ${rGridResource.getUrl()} with dependencies --> ${cacheEntryKeys}`,
          )
        } else if (rGridResource.isHttp()) {
          missingResources.push(rGridResource)
        }
      }

      await Promise.all(
        missingResources.map(async rGridResource => {
          try {
            const resourceCookies = getResourceCookies(rGridResource.getUrl(), cookies)
            const fetchOptions = getFetchOptions({
              rGridResource,
              referer,
              userAgent,
              proxySettings,
              resourceCookies,
            })
            const resource = await fetchResource(rGridResource, fetchOptions)
            return assignContentfulResources(resources, await processResource(resource))
          } catch (err) {
            logger.log(
              `error fetching resource at ${rGridResource.getUrl()}, setting errorStatusCode to 504. err=${err}`,
            )
            rGridResource.setErrorStatusCode(504)
            resources[rGridResource.getUrl()] = rGridResource
          }
        }),
      )

      return resources
    }

    async function processResource(rGridResource) {
      let {dependentResources, fetchedResources} = await getDependantResources(rGridResource)
      // It is time consuming to process css/svg so use "resourceCache".
      const doesRequireProcessing = !!resourceType(rGridResource.getContentType())
      if (doesRequireProcessing) {
        resourceCache.setValue(rGridResource.getCacheKey(), toCacheEntry(rGridResource))
      }
      resourceCache.setDependencies(rGridResource.getCacheKey(), dependentResources)
      return Object.assign({[rGridResource.getUrl()]: rGridResource}, fetchedResources)
    }

    async function getDependantResources(rGridResource) {
      let dependentResources, fetchedResources
      const rType = resourceType(rGridResource.getContentType())
      const value = rGridResource.getContent()
      const url = rGridResource.getUrl()

      try {
        if (rType === 'CSS') {
          dependentResources = extractCssResources(value.toString())
        } else if (rType === 'SVG') {
          dependentResources = extractSvgResources(value.toString())
        }
      } catch (e) {
        logger.log(`could not parse ${rType} ${url}`, e)
      }

      if (dependentResources && dependentResources.length > 0) {
        dependentResources = dependentResources.map(u => absolutizeUrl(u, url))
        logger.log(`dependentResources for ${rGridResource.getUrl()} --> ${dependentResources}`)
        fetchedResources = await getOrFetchResources(dependentResources)
        logger.log(
          `fetchedResources for ${rGridResource.getUrl()} --> ${Object.keys(fetchedResources)}`,
        )
      }
      return {dependentResources, fetchedResources}
    }
  }
}

module.exports = makeGetAllResources
