import {makeResource, type ContentfulResource} from './resource'

export function makeResourceDom({cdt, resources}): ContentfulResource {
  const value = Buffer.from(
    JSON.stringify({
      resources: Object.fromEntries(Object.entries(resources).sort(([url1], [url2]) => (url1 > url2 ? 1 : -1))),
      domNodes: cdt,
    }),
  )
  return makeResource({value, contentType: 'x-applitools-html/cdt'})
}
