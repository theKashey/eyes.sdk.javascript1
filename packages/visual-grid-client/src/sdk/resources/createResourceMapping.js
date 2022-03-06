'use strict'

const createResource = require('./createResource')
const createDomResource = require('./createDomResource')

function makeCreateResourceMapping({processResources}) {
  return async function createResourceMapping({
    snapshot,
    browserName,
    userAgent,
    cookies,
    proxy,
    autProxy,
  }) {
    const processedSnapshotResources = await processSnapshotResources({
      snapshot,
      browserName,
      userAgent,
      cookies,
      proxy,
      autProxy,
    })

    const resources = await processedSnapshotResources.promise

    const dom = resources[snapshot.url]
    delete resources[snapshot.url]

    return {dom, resources}
  }

  async function processSnapshotResources({
    snapshot,
    browserName,
    userAgent,
    cookies,
    proxy,
    autProxy,
  }) {
    const [snapshotResources, ...frameResources] = await Promise.all([
      processResources({
        resources: {
          ...(snapshot.resourceUrls || []).reduce((resources, url) => {
            return Object.assign(resources, {[url]: createResource({url, browserName})})
          }, {}),
          ...Object.entries(snapshot.resourceContents || {}).reduce(
            (resources, [url, resource]) => {
              return Object.assign(resources, {[url]: createResource(resource)})
            },
            {},
          ),
        },
        referer: snapshot.url,
        browserName,
        userAgent,
        cookies,
        proxy,
        autProxy,
      }),
      ...(snapshot.frames || []).map(frameSnapshot => {
        return processSnapshotResources({
          snapshot: frameSnapshot,
          browserName,
          userAgent,
          cookies,
          proxy,
          autProxy,
        })
      }),
    ])

    const frameDomResourceMapping = frameResources.reduce((mapping, resources, index) => {
      const frameUrl = snapshot.frames[index].url
      return Object.assign(mapping, {[frameUrl]: resources.mapping[frameUrl]})
    }, {})

    const domResource = await processResources({
      resources: {
        [snapshot.url]: createDomResource({
          cdt: snapshot.cdt,
          resources: {...snapshotResources.mapping, ...frameDomResourceMapping},
        }),
      },
    })

    const frameResourceMapping = frameResources.reduce((mapping, resources) => {
      return Object.assign(mapping, resources.mapping)
    }, {})

    const resourceMapping = {
      ...frameResourceMapping,
      ...snapshotResources.mapping,
      ...domResource.mapping,
    }
    return {
      mapping: resourceMapping,
      promise: Promise.all([
        snapshotResources.promise,
        domResource.promise,
        ...frameResources.map(resources => resources.promise),
      ]).then(() => resourceMapping),
    }
  }
}

module.exports = makeCreateResourceMapping
