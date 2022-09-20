import {Proxy} from '@applitools/types'
import globalReq, {makeReq, mergeOptions, Request, type Req, type Options, type Hooks, type Fetch} from '@applitools/req'
import {Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

export type ReqEyesConfig = {
  serverUrl: string
  apiKey: string
  proxy?: Proxy
  agentId?: string
  connectionTimeout?: number
  removeSession?: boolean
}

export type ReqEyesOptions = Options & {
  name?: string
  expected?: number | number[]
  logger?: Logger
}

export type ReqEyes = Req<ReqEyesOptions>

export function makeReqEyes({config, fetch, logger}: {config: ReqEyesConfig; fetch?: Fetch; logger?: Logger}) {
  return makeReq<ReqEyesOptions>({
    baseUrl: config.serverUrl,
    query: {apiKey: config.apiKey, removeSession: config.removeSession},
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-applitools-eyes-client': config.agentId,
      'User-Agent': config.agentId,
    },
    proxy: config.proxy,
    timeout: config.connectionTimeout ?? 300000 /* 5min */,
    retry: [
      // retry on network issues
      {
        limit: 5,
        timeout: 200,
        statuses: [404, 500, 502, 504],
        codes: ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'],
      },
      // retry on requests that were blocked by concurrency
      {
        timeout: [].concat(Array(5).fill(2000) /* 5x2s */, Array(4).fill(5000) /* 4x5s */, 10000 /* 10s */),
        statuses: [503],
      },
    ],
    hooks: [handleLongRequests({req: globalReq}), handleLogs({logger}), handleUnexpectedResponse()],
    fetch,
  })
}

function handleLogs({logger: defaultLogger}: {logger?: Logger} = {}): Hooks<ReqEyesOptions> {
  const guid = utils.general.guid()
  let counter = 0

  return {
    beforeRequest({request, options}) {
      const logger = options.logger ?? defaultLogger
      let requestId = request.headers.get('x-applitools-eyes-client-request-id')
      if (!requestId) {
        requestId = `${counter++}--${guid}`
        request.headers.set('x-applitools-eyes-client-request-id', requestId)
      }

      logger?.log(
        `Request "${options.name}" [${requestId}] will be sent to the address "[${request.method}]${request.url}" with body`,
        options.body,
      )
    },
    beforeRetry({request, attempt}) {
      const [requestId] = request.headers.get('x-applitools-eyes-client-request-id')?.split('#') ?? []
      if (requestId) {
        request.headers.set('x-applitools-eyes-client-request-id', `${requestId}#${attempt + 1}`)
      }
    },
    async afterResponse({request, response, options}) {
      const logger = options.logger ?? defaultLogger
      const requestId = request.headers.get('x-applitools-eyes-client-request-id')
      logger?.log(
        `Request "${options.name}" [${requestId}] that was sent to the address "[${request.method}]${request.url}" respond with ${response.statusText}(${response.status})`,
        !response.ok ? `and body ${JSON.stringify(await response.clone().text())}` : '',
      )
    },
    afterError({request, error, options}) {
      const logger = options.logger ?? defaultLogger
      const requestId = request.headers.get('x-applitools-eyes-client-request-id')
      logger?.error(
        `Request "${options.name}" [${requestId}] that was sent to the address "[${request.method}]${request.url}" failed with error`,
        error,
      )
    },
  }
}

function handleUnexpectedResponse(): Hooks<ReqEyesOptions> {
  return {
    async afterResponse({request, response, options}) {
      const {expected, name} = options
      if (expected && (utils.types.isArray(expected) ? !expected.includes(response.status) : expected !== response.status)) {
        throw new Error(
          `Request "${name}" that was sent to the address "[${request.method}]${request.url}" failed due to unexpected status ${response.statusText}(${response.status})`,
        )
      }
    },
  }
}

function handleLongRequests({req}: {req: Req}): Hooks {
  return {
    beforeRequest({request}) {
      request.headers.set('Eyes-Expect-Version', '2')
      request.headers.set('Eyes-Expect', '202+location')
      request.headers.set('Eyes-Date', new Date().toUTCString())
    },
    async afterResponse({request, response, options}) {
      if (response.status === 202 && response.headers.has('Location')) {
        if (response.headers.has('Retry-After')) {
          await utils.general.sleep(Number(response.headers.get('Retry-After')) * 1000)
        }

        // polling for result
        const pollResponse = await req(
          response.headers.get('Location'),
          mergeOptions(options, {
            method: 'GET',
            body: null,
            expected: null,
            retry: {
              statuses: [200],
              timeout: [].concat(Array(5).fill(1000) /* 5x1s */, Array(5).fill(2000) /* 5x2s */, 5000 /* 5s */),
            },
            hooks: {
              beforeRetry({request, response}) {
                if (response.status === 200 && response.headers.has('Location')) {
                  return new Request(response.headers.get('Location'), request)
                }
              },
            },
          } as ReqEyesOptions),
        )

        // getting result of the initial request
        const resultResponse = await req(
          pollResponse.headers.get('Location'),
          mergeOptions(options, {
            method: 'DELETE',
            expected: null,
            hooks: {
              beforeRetry({response, stop}) {
                // if the long request is blocked due to concurrency the whole long request should start over
                if (response.status === 503) return stop
              },
            },
          } as ReqEyesOptions),
        )

        return resultResponse.status === 503 ? req(request, options) : resultResponse
      }
    },
  }
}
