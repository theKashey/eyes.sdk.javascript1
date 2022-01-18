const {RGridResource} = require('@applitools/eyes-sdk-core/shared')

// There are resources we are know about, and we also know bout all of their dependencies
//
//
//
//
//
//
//

function makeBlackBox({fetchResource, putResources, resourceCache = new Map()}) {
  const cache = new Map()

  return function blackBox({
    url,
    resourceUrls,
    resourceContents,
    cookies,
    userAgent,
    browserName,
    proxy,
  } = {}) {
    const result = {}

    for (const [url, resource] of Object.entries(resourceContents)) {
      const rGridResource = new RGridResource({url: resource.url})
      if (resource.errorStatusCode) {
        resource.setErrorStatusCode(resource.errorStatusCode)
      } else {
        resource.setContentType(resource.type)
        resource.setContent(resource.content || '')
      }

      const cacheEntry = {
        value: putResources([rGridResource]).then(([value]) => value),
        dependencies: resource.dependencies,
      }
      resourceCache.set(rGridResource.getCacheKey(), cacheEntry)

      // handledResourceUrls.add(url)
      assignContentfulResources(resources, {[url]: rGridResource})
    }


  }
}
