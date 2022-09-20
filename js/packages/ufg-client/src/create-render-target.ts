import {type ProcessResources, type ProcessResourcesSettings, type ResourceMapping} from './process-resources'
import {makeResource, type HashedResource} from './resource'
import {makeResourceDom} from './resource-dom'
import {makeResourceVhs} from './resource-vhs'

export type RenderTarget = {
  snapshot: HashedResource
  resources: Record<string, HashedResource | {errorStatusCode: number}>
  source?: string
  vhsType?: string
  vhsCompatibilityParams?: Record<string, any>
}

export type CreateRenderTarget = (options: {snapshot: any; settings?: ProcessResourcesSettings}) => Promise<RenderTarget>

export function makeCreateRenderTarget({processResources}: {processResources: ProcessResources}): CreateRenderTarget {
  return async function createRenderTarget({snapshot, settings}: {snapshot: any; settings?: ProcessResourcesSettings}) {
    const isWeb = !!snapshot.cdt
    const processedSnapshotResources = await processSnapshotResources({snapshot, settings})

    const resources = await processedSnapshotResources.promise

    const hashedSnapshot = resources[isWeb ? snapshot.url : 'vhs'] as HashedResource
    if (isWeb) {
      delete resources[snapshot.url]
    }

    return {
      snapshot: hashedSnapshot,
      resources,
      source: snapshot.url,
      vhsType: snapshot.vhsType,
      vhsCompatibilityParams: snapshot.vhsCompatibilityParams,
    }
  }

  async function processSnapshotResources({
    snapshot,
    settings,
  }: {
    snapshot: any
    settings?: ProcessResourcesSettings
  }): Promise<{mapping: ResourceMapping; promise: Promise<ResourceMapping>}> {
    const [snapshotResources, ...frameResources] = await Promise.all([
      processResources({
        resources: {
          ...(snapshot.resourceUrls ?? []).reduce((resources, url) => {
            return Object.assign(resources, {[url]: makeResource({url, renderer: settings?.renderer})})
          }, {}),
          ...Object.entries(snapshot.resourceContents ?? {}).reduce((resources, [url, resource]: [string, any]) => {
            return Object.assign(resources, {
              [url]: resource.errorStatusCode
                ? makeResource({id: url, errorStatusCode: resource.errorStatusCode})
                : makeResource({url, value: resource.value, contentType: resource.type, dependencies: resource.dependencies}),
            })
          }, {}),
        },
        settings: {referer: snapshot.url, ...settings},
      }),
      ...(snapshot.frames ?? []).map(frameSnapshot => {
        return processSnapshotResources({snapshot: frameSnapshot, settings})
      }),
    ])

    const frameDomResourceMapping = frameResources.reduce((mapping, resources, index) => {
      const frameUrl = snapshot.frames[index].url
      return Object.assign(mapping, {[frameUrl]: resources.mapping[frameUrl]})
    }, {})

    const resourceMappingWithoutDom = {...snapshotResources.mapping, ...frameDomResourceMapping}
    const domResource = snapshot.cdt
      ? {
          [snapshot.url]: makeResourceDom({
            cdt: snapshot.cdt,
            resources: resourceMappingWithoutDom,
          }),
        }
      : {
          vhs: makeResourceVhs({
            vhsHash: snapshot.vhsHash /* android */ ?? snapshotResources.mapping.vhs /* ios */,
            vhsType: snapshot.vhsType, // will only be populated in android
            platformName: snapshot.platformName,
            resources: resourceMappingWithoutDom, // this will be empty until resources are supported inside VHS
          }),
        }

    const processedDomResource = await processResources({resources: domResource})

    const frameResourceMapping = frameResources.reduce((mapping, resources) => {
      return Object.assign(mapping, resources.mapping)
    }, {})

    const resourceMapping = {
      ...frameResourceMapping,
      ...snapshotResources.mapping,
      ...processedDomResource.mapping,
    }
    return {
      mapping: resourceMapping,
      promise: Promise.all([
        snapshotResources.promise,
        processedDomResource.promise,
        ...frameResources.map(resources => resources.promise),
      ]).then(() => resourceMapping),
    }
  }
}
