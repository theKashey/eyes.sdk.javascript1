import {parse as urlToHttpOptions} from 'url' // should be replaced with `urlToHttpOptions` after supporting node >=16
import {AbortController} from 'abort-controller'
import {Agent as HttpsAgent} from 'https'
import ProxyAgent from 'proxy-agent'
import globalFetch, {Request, Response} from 'node-fetch'
import * as utils from '@applitools/utils'

const stop = Symbol('stop retry')

export type Options = {
  /**
   * Providing this value will allow usage of relative urls for input
   * @example 'http://localhost:2107/api/'
   */
  baseUrl?: string
  /**
   * Uppercase method name. This will override method provided in `Request` object
   * @example 'GET'
   */
  method?: string
  /**
   * Query parameters to add to the url, all undefined params won't be added.
   * It won't override the whole `search` part of the url, but instead merge with it
   * @example {string: 'value', number: 21, boolean: true, noop: undefined}
   */
  query?: Record<string, string | boolean | number | undefined>
  /**
   * Headers to send in the request, all undefined headers won't be sent.
   * This will merge with headers provided in `Request` object
   * @example {'x-my-header': 'value', 'x-noop-header': undefined}
   */
  headers?: Record<string, string | undefined>
  /**
   * Body of the request, plain objects will be transformed to JSON strings
   * @example {data: true}
   * @example Buffer.from('S3lyeWxv', 'base64')
   */
  body?: NodeJS.ReadableStream | ArrayBufferView | string | Record<string, any>
  /**
   * Proxy settings for the request. Auth credentials specified in the object will override ones specified in url
   * @example {url: 'http://localhost:2107', username: 'kyrylo', password: 'pass'}
   */
  proxy?: {url: string; username: string; password: string}
  /**
   * Connection timeout in ms
   * @example 7000
   */
  timeout?: number
  /**
   * Retry settings for the request. If specified as an array the retries are applied in the order
   * @see Retry
   * @example {limit: 5, statuses: [500, 501], codes: ['ECONRESET'], timeout: 1000}
   */
  retry?: Retry | Retry[]
  /**
   * Hooks of the request
   * @see Hooks
   */
  hooks?: Hooks | Hooks[]
  fetch?: typeof globalFetch
}

export type Retry = {
  /**
   * Max number of attempts for specified condition
   */
  limit?: number
  /**
   * Timeout before retrying the request. If specified as an array each element specifies the timeout for specific attempt,
   * and the last one will be default for all next attempts
   * @example [1000, 1000, 5000, 10_000]
   */
  timeout?: number | number[]
  /**
   * Validation logic of the request outcome to retry on.
   * @example ({response, error}) => error || response.status >= 400
   */
  validate?: (options: {response?: Response; error?: Error}) => boolean
  /**
   * Status codes of the response to retry on.
   * @example [500]
   */
  statuses?: number[]
  /**
   * Error codes of the request to retry on.
   * @example ['ECONRESET']
   */
  codes?: string[]
  /**
   * Number of the current attempt for specified condition
   * @internal
   */
  attempt?: number
}

export type Hooks = {
  /**
   * Hook that will be executed before sending the request, after all, modifications of the `Request` object are already passed
   * @example
   * ```
   * {
   *   beforeRequest({request}) {
   *      request.headers.set('Expires', 'Tue, 24 Aug 2022 00:00:00 GMT')
   *   }
   * }
   * ```
   */
  beforeRequest?(options: {request: Request; options: Options}): Request | void | Promise<Request | void>
  /**
   * Hook that will be executed before retrying the request. If this hook will return {@link req.stop}
   * it will prevent request from retrying and execution of other hooks
   * @example
   * ```
   * {
   *   async beforeRetry({request, response, attempt}) {
   *      const data = await response?.json()
   *      if (data.error) return req.stop
   *      request.headers.set('x-attempt', attempt)
   *   }
   * }
   * ```
   */
  beforeRetry?(options: {
    request: Request
    attempt: number
    stop: typeof stop
    response?: Response
    error?: Error
    options: Options
  }): Request | typeof stop | void | Promise<Request | void | typeof stop>
  /**
   * Hook that will be executed after getting the final response of the request (after all of the retries)
   * @example
   * ```
   * {
   *   async afterResponse({request, response, options}) {
   *      if (!response.ok) return req(request, options)
   *   }
   * }
   * ```
   */
  afterResponse?(options: {request: Request; response: Response; options: Options}): Response | void | Promise<Response | void>
  /**
   * Hook that will be executed after request will throw an error
   * @example
   * ```
   * {
   *   async afterError({request, error}) {
   *      error.request = request
   *   }
   * }
   * ```
   */
  afterError?(options: {request: Request; error: Error; options: Options}): Error | void | Promise<Error | void>
}

/**
 * Helper function that will properly merge two {@link Options} objects
 */
export function mergeOptions<TOptions extends Options>(baseOption: TOptions, options: TOptions): TOptions {
  return {
    ...baseOption,
    ...options,
    query: {...baseOption.query, ...options?.query},
    headers: {...baseOption.headers, ...options?.headers},
    retry: [...(baseOption.retry ? [].concat(baseOption.retry) : []), ...(options?.retry ? [].concat(options.retry) : [])],
    hooks: [...(baseOption.hooks ? [].concat(baseOption.hooks) : []), ...(options?.hooks ? [].concat(options.hooks) : [])],
  }
}

/**
 * Helper function that will create {@link req} function with predefined options
 * @example const req = makeReq({baseUrl: 'http://localhost:2107'})
 */
export function makeReq(baseOption?: Options): typeof req {
  return (location, options) => req(location, mergeOptions(baseOption, options))
}

export async function req(input: string | URL | Request, options?: Options): Promise<Response> {
  const fetch = options?.fetch ?? globalFetch

  if (options?.hooks) options.hooks = utils.types.isArray(options.hooks) ? options.hooks : [options.hooks]
  if (options?.retry) options.retry = utils.types.isArray(options.retry) ? options.retry : [options.retry]
  if (options?.headers) {
    options.headers = Object.fromEntries(Object.entries(options.headers).filter(([_, value]) => value))
  }

  const beforeRequest = ({request, ...rest}: Parameters<Hooks['beforeRequest']>[0]) =>
    ((options?.hooks as Hooks[]) ?? []).reduce(async (request, hooks) => {
      request = await request
      const result = (await hooks.beforeRequest?.({request, ...rest})) || null
      return result?.clone() ?? request
    }, request as Request | Promise<Request>)
  const beforeRetry = ({request, ...rest}: Parameters<Hooks['beforeRetry']>[0]) =>
    ((options?.hooks as Hooks[]) ?? []).reduce(async (request, hooks) => {
      request = await request
      if (request === stop) return request
      const result = (await hooks.beforeRetry?.({request, ...rest})) || null
      return result === stop ? result : result?.clone() ?? request
    }, request as Request | typeof stop | Promise<Request | typeof stop>)
  const afterResponse = ({response, ...rest}: Parameters<Hooks['afterResponse']>[0]) =>
    ((options?.hooks as Hooks[]) ?? [])?.reduce(async (response, hooks) => {
      response = await response
      const result = (await hooks.afterResponse?.({response, ...rest})) || null
      return result?.clone() ?? response
    }, response as Response | Promise<Response>)
  const afterError = ({error, ...rest}: Parameters<Hooks['afterError']>[0]) =>
    ((options?.hooks as Hooks[]) ?? [])?.reduce(async (error, hooks) => {
      error = await error
      return (await hooks.afterError?.({error, ...rest})) || error
    }, error as Error | Promise<Error>)

  const controller = new AbortController()

  const url = new URL(String((input as Request).url ?? input), options?.baseUrl)
  if (options?.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (!utils.types.isNull(value)) url.searchParams.set(key, String(value))
    })
  }
  let request = new Request(url, {
    method: options?.method ?? (input as Request).method,
    headers: {...options?.headers, ...Object.fromEntries((input as Request).headers?.entries() ?? [])},
    body: utils.types.isPlainObject(options?.body) ? JSON.stringify(options.body) : options?.body ?? (input as Request).body,
    agent: url => {
      if (options?.proxy) {
        const proxyUrl = new URL(options.proxy.url)
        proxyUrl.username = options.proxy.username ?? proxyUrl.username
        proxyUrl.password = options.proxy.password ?? proxyUrl.password
        const agent = new ProxyAgent({...urlToHttpOptions(proxyUrl.href), rejectUnauthorized: false} as any)
        const originalCallback = agent.callback.bind(agent)
        agent.callback = (request, options, callback?: any) =>
          originalCallback(request, {...options, rejectUnauthorized: false}, callback)
        return agent
      } else if (url.protocol === 'https:') {
        return new HttpsAgent({rejectUnauthorized: false})
      }
    },
    signal: controller.signal,
  })

  request = await beforeRequest({request: request.clone(), options})
  const timer = options?.timeout > 0 ? setTimeout(() => controller.abort(), options.timeout) : null
  try {
    let response = await fetch(request)

    // if the request has to be retried due to status code
    const retry = (options?.retry as Retry[])?.find(
      retry =>
        (retry.statuses?.includes(response.status) && (!retry.limit || !retry.attempt || retry.attempt < retry.limit)) ||
        retry.validate?.({response}),
    )
    if (retry) {
      retry.attempt ??= 0
      let delay = response.headers.has('Retry-After') ? Number(response.headers.get('Retry-After')) * 1000 : null
      delay ??= utils.types.isArray(retry.timeout) ? retry.timeout[Math.min(retry.attempt, retry.timeout.length)] : retry.timeout
      await utils.general.sleep(delay)
      retry.attempt += 1

      const retryRequest = await beforeRetry({
        request: request.clone(),
        response: response.clone(),
        attempt: retry.attempt,
        stop,
        options,
      })
      if (retryRequest !== stop) {
        return req(retryRequest, options)
      }
    }

    response = await afterResponse({request: request.clone(), response: response.clone(), options})
    return response
  } catch (error) {
    // if the request has to be retried due to network error
    const retry = (options?.retry as Retry[])?.find(
      retry =>
        (retry.codes?.includes(error.code) && (!retry.limit || !retry.attempt || retry.attempt < retry.limit)) ||
        retry.validate?.({error}),
    )
    if (retry) {
      retry.attempt ??= 0
      const delay = utils.types.isArray(retry.timeout)
        ? retry.timeout[Math.min(retry.attempt, retry.timeout.length)]
        : retry.timeout
      await utils.general.sleep(delay)
      retry.attempt = retry.attempt + 1

      const retryRequest = await beforeRetry({request: request.clone(), error, attempt: retry.attempt, stop, options})
      if (retryRequest !== stop) {
        return req(retryRequest, options)
      }
    }

    error = await afterError({request, error, options})
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export type Req = typeof req

export default req
