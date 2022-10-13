import type {Renderer} from '../types'
import {
  makeResource,
  type UrlResource,
  type ContentfulResource,
  type HashedResource,
  type KnownResource,
  type FailedResource,
} from './resource'
import {type Logger} from '@applitools/logger'
import {type FetchResource, type FetchResourceSettings} from './fetch-resource'
import {type UploadResource} from './upload-resource'
import {extractCssDependencyUrls} from '../utils/extract-css-dependency-urls'
import {extractSvgDependencyUrls} from '../utils/extract-svg-dependency-urls'
import * as utils from '@applitools/utils'

export type ProcessResources = (options: {
  resources: Record<string, FailedResource | ContentfulResource | UrlResource>
  settings?: ProcessResourcesSettings
}) => Promise<{mapping: ResourceMapping; promise: Promise<ResourceMapping>}>

export type ProcessResourcesSettings = FetchResourceSettings & {renderer?: Renderer}

export type ResourceMapping = Record<string, HashedResource | {errorStatusCode: number}>

export function makeProcessResources({
  fetchResource,
  uploadResource,
  cache = new Map(),
  logger,
}: {
  fetchResource: FetchResource
  uploadResource: UploadResource
  cache?: Map<string, KnownResource & {ready: boolean | Promise<boolean>}>
  logger?: Logger
}): ProcessResources {
  return async function processResources({
    resources,
    settings,
  }: {
    resources: Record<string, ContentfulResource | UrlResource | FailedResource>
    settings?: ProcessResourcesSettings
  }): Promise<{mapping: ResourceMapping; promise: Promise<ResourceMapping>}> {
    const processedResources = await Object.entries(resources).reduce(async (processedResourcesPromise, [url, resource]) => {
      if (utils.types.has(resource, 'value') || utils.types.has(resource, 'errorStatusCode')) {
        // process contentful resource or failed resource
        const processedResource = await processContentfulResource({resource})
        return Object.assign(await processedResourcesPromise, {[url]: processedResource})
      } else {
        // process url resource with dependencies
        const processedResourceWithDependencies = await processUrlResourceWithDependencies({resource, settings})
        return Object.assign(await processedResourcesPromise, processedResourceWithDependencies)
      }
    }, Promise.resolve({} as Record<string, KnownResource & {ready: boolean | Promise<boolean>}>))

    const mapping = {} as ResourceMapping
    const ready = [] as (boolean | Promise<boolean>)[]
    for (const [url, processedResource] of Object.entries(processedResources)) {
      mapping[url] = processedResource.hash
      ready.push(processedResource.ready)
    }

    return {mapping, promise: Promise.all(ready).then(() => mapping)}
  }

  async function processContentfulResource({resource}: {resource: ContentfulResource | FailedResource}): Promise<KnownResource> {
    return persistResource({resource})
  }

  async function processUrlResource({
    resource,
    settings,
  }: {
    resource: UrlResource
    settings: ProcessResourcesSettings
  }): Promise<KnownResource> {
    const cachedResource = cache.get(resource.id)
    if (cachedResource) {
      const dependencies = cachedResource.dependencies || []
      logger?.log(
        `resource retrieved from cache, with dependencies (${dependencies.length}): ${resource.url} with dependencies --> ${dependencies}`,
      )
      return cachedResource
    } else if (/^https?:$/i.test(new URL(resource.url).protocol)) {
      try {
        const fetchedResource = await fetchResource({resource, settings})
        const dependencyUrls = utils.types.has(fetchedResource, 'value')
          ? await extractDependencyUrls({resource: fetchedResource})
          : []
        logger?.log(`dependencyUrls for ${resource.url} --> ${dependencyUrls}`)

        return persistResource({resource: fetchedResource, dependencies: dependencyUrls})
      } catch (err) {
        logger?.log(`error fetching resource at ${resource.url}, setting errorStatusCode to 504. err=${err}`)
        return makeResource({...resource, errorStatusCode: 504})
      }
    }
  }

  async function processUrlResourceWithDependencies({
    resource,
    settings,
  }: {
    resource: UrlResource
    settings: ProcessResourcesSettings
  }): Promise<Record<string, KnownResource>> {
    const processedResourcesWithDependencies = {} as Record<string, KnownResource>

    await doProcessUrlResourceWithDependencies(resource)

    return processedResourcesWithDependencies

    async function doProcessUrlResourceWithDependencies(resource) {
      const processedResource = await processUrlResource({resource, settings})

      if (processedResource) {
        processedResourcesWithDependencies[resource.url] = processedResource
        if (processedResource.dependencies) {
          const dependencyResources = processedResource.dependencies.flatMap(dependencyUrl => {
            if (processedResourcesWithDependencies[dependencyUrl]) return []
            return makeResource({url: dependencyUrl, renderer: settings.renderer})
          })
          await Promise.all(dependencyResources.map(doProcessUrlResourceWithDependencies))
        }
      }
    }
  }

  async function persistResource({
    resource,
    dependencies,
  }: {
    resource: ContentfulResource | FailedResource
    dependencies?: string[]
  }): Promise<KnownResource & {ready: boolean | Promise<boolean>}> {
    const entry = {
      hash: resource.hash,
      dependencies: (resource as ContentfulResource).dependencies ?? dependencies,
    } as KnownResource & {ready: boolean | Promise<boolean>}
    if (utils.types.has(resource, 'value')) {
      entry.ready = uploadResource({resource})
        .then(() => {
          const entry = cache.get(resource.id)
          cache.set(resource.id, {...entry, ready: true})
          return true
        })
        .catch(err => {
          cache.delete(resource.id)
          throw err
        })
    } else {
      entry.ready = true
    }
    cache.set(resource.id, entry)
    return entry
  }

  async function extractDependencyUrls({resource}: {resource: ContentfulResource}): Promise<string[]> {
    try {
      let dependencyUrls = []
      if (/text\/css/.test(resource.contentType)) {
        dependencyUrls = extractCssDependencyUrls(resource.value.toString())
      } else if (/image\/svg/.test(resource.contentType)) {
        dependencyUrls = extractSvgDependencyUrls(resource.value.toString())
      }
      return dependencyUrls.reduce((dependencyUrls, dependencyUrl) => {
        dependencyUrl = utils.general.absolutizeUrl(dependencyUrl, resource.url)
        // skip recursive dependency
        if (dependencyUrl !== resource.url) dependencyUrls.push(dependencyUrl)
        return dependencyUrls
      }, [])
    } catch (e) {
      logger?.log(`could not parse ${resource.contentType} ${resource.url}`, e)
      return []
    }
  }
}
