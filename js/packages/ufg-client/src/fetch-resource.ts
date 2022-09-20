import type {AutProxy, Proxy, Cookie} from '@applitools/types'
import type {Logger} from '@applitools/types'
import {makeReq, Request, Response, AbortController, type Fetch, type Hooks, type AbortSignal} from '@applitools/req'
import {makeResource, type UrlResource, type ContentfulResource, FailedResource} from './resource'
import {createCookieHeader} from './utils/create-cookie-header'
import {createUserAgentHeader} from './utils/create-user-agent-header'

export type FetchResourceSettings = {
  referer?: string
  proxy?: Proxy
  autProxy?: AutProxy
  cookies?: Cookie[]
  userAgent?: string
}

export type FetchResource = (options: {
  resource: UrlResource
  settings?: FetchResourceSettings
}) => Promise<ContentfulResource | FailedResource>

export function makeFetchResource({
  retryLimit = 5,
  streamingTimeout = 30 * 1000,
  cache = new Map(),
  fetch,
  logger,
}: {
  retryLimit?: number
  streamingTimeout?: number
  cache?: Map<string, Promise<ContentfulResource | FailedResource>>
  fetch?: Fetch
  logger?: Logger
} = {}): FetchResource {
  const req = makeReq({
    retry: {
      limit: retryLimit,
      validate: ({error}) => Boolean(error),
    },
    fetch,
  })

  return async function fetchResource({
    resource,
    settings = {},
  }: {
    resource: UrlResource
    settings?: FetchResourceSettings
  }): Promise<ContentfulResource | FailedResource> {
    let runningRequest = cache.get(resource.id)
    if (runningRequest) return runningRequest

    runningRequest = req(resource.url, {
      headers: {
        Referer: settings.referer,
        Cookie: createCookieHeader({url: resource.url, cookies: settings.cookies}),
        'User-Agent': createUserAgentHeader({renderer: resource.renderer}) ?? settings.userAgent,
      },
      proxy: resourceUrl => {
        const {proxy, autProxy} = settings
        if (autProxy) {
          if (!autProxy.domains) return autProxy
          const domainMatch = autProxy.domains.includes(resourceUrl.hostname)
          if ((autProxy.mode === 'Allow' && domainMatch) || (autProxy.mode === 'Block' && !domainMatch)) return autProxy
        }
        return proxy
      },
      hooks: [handleLogs({logger}), handleStreaming({timeout: streamingTimeout, logger})],
    })
      .then(async response => {
        return response.ok
          ? makeResource({
              ...resource,
              value: Buffer.from(await response.arrayBuffer()),
              contentType: response.headers.get('Content-Type'),
            })
          : makeResource({...resource, errorStatusCode: response.status})
      })
      .finally(() => cache.delete(resource.id))
    cache.set(resource.id, runningRequest)
    return runningRequest
  }
}

function handleLogs({logger}: {logger: Logger}): Hooks {
  return {
    beforeRequest({request}) {
      logger?.log(`Resource with url ${request.url} will be fetched using headers`, Object.fromEntries(request.headers.entries()))
    },
    beforeRetry({request, attempt}) {
      logger?.log(`Resource with url ${request.url} will be re-fetched (attempt ${attempt})`)
    },
    afterResponse({request, response}) {
      logger?.log(`Resource with url ${request.url} respond with ${response.statusText}(${response.statusText})`)
    },
    afterError({request, error}) {
      logger?.error(`Resource with url ${request.url} failed with error`, error)
    },
  }
}

function handleStreaming({timeout, logger}: {timeout: number; logger: Logger}): Hooks {
  const controller = new AbortController()
  return {
    async beforeRequest({request}: {request: Request & {signal?: AbortSignal}}) {
      if (request.signal?.aborted) return
      request.signal?.addEventListener('abort', () => controller.abort(), {once: true})
      return new Request(request, {signal: controller.signal})
    },
    async afterResponse({response}) {
      const isProbablyStreaming =
        response.ok &&
        !response.headers.get('Content-Length') &&
        ['audio/', 'video/'].some(prefix => response.headers.get('Content-Type').startsWith(prefix))
      if (!isProbablyStreaming) return
      return new Promise<Response>(resolve => {
        const timer = setTimeout(() => {
          controller.abort()
          resolve(new Response(null, {status: 599}))
          logger?.log(`Resource with url ${response.url} was interrupted, due to it takes too long to download`)
        }, timeout)
        response
          .arrayBuffer()
          .then(body => resolve(new Response(body, response)))
          .catch(() => resolve(new Response(null, {status: 599})))
          .finally(() => clearTimeout(timer))
      })
    },
  }
}
