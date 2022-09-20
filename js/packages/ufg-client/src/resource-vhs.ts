import {makeResource, type ContentfulResource} from './resource'

export function makeResourceVhs({vhsHash, resources, vhsType, platformName}): ContentfulResource {
  const value = Buffer.from(
    JSON.stringify({
      vhs: vhsHash,
      resources: {...resources, vhs: undefined},
      metadata: {platformName: platformName, vhsType: vhsType},
    }),
  )
  return makeResource({value, contentType: 'x-applitools-resource-map/native'})
}
