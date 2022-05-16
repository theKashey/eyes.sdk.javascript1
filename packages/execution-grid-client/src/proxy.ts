import {type Readable} from 'stream'
import {type AbortSignal} from 'abort-controller'
import {type Logger} from '@applitools/logger'
import {request as sendHttp, type IncomingMessage, type ServerResponse} from 'http'
import {request as sendHttps} from 'https'
import {resolve as resolveDns} from 'dns'
import ProxyAgent from 'proxy-agent'
import * as utils from '@applitools/utils'

type RequestOptions = {
  url?: URL | string
  method: string
  headers?: Record<string, string | string[]>
  body?: string | Buffer | Readable
  proxy?: string
  signal?: AbortSignal
}

type ProxyOptions = Partial<RequestOptions> & {
  handle?: boolean
  modifyRequest?: (options: RequestOptions) => Promise<RequestOptions> | RequestOptions
  shouldRetry?: (proxyResponse: IncomingMessage) => Promise<boolean> | boolean
  retryTimeout?: number
}

export function makeProxy(defaultOptions?: Partial<ProxyOptions> & {resolveUrls?: boolean}) {
  const resolveUrl = defaultOptions?.resolveUrls ? makeResolveUrl() : (url: string | URL) => url

  return async function proxyRequest({
    request,
    response,
    options,
    logger,
  }: {
    request: IncomingMessage
    response: ServerResponse
    options?: ProxyOptions
    logger: Logger
  }): Promise<IncomingMessage> {
    options = {...defaultOptions, ...options}

    const isProxyRequest = !options.url && /^http/.test(request.url)
    const requestOptions = {
      url: isProxyRequest
        ? request.url
        : new URL(`.${request.url}` /* relative path */, await resolveUrl(options.url, {logger})),
      method: options.method ?? request.method,
      headers: {...request.headers, ...options.headers} as Record<string, string | string[]>,
      body: options.body,
      proxy: options.proxy,
      signal: options.signal,
    }
    requestOptions.headers.host = new URL(isProxyRequest ? request.url : options.url).host
    if (requestOptions.body && !utils.types.isFunction(requestOptions.body, 'pipe')) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(requestOptions.body).toString()
    } else {
      requestOptions.body = request
    }
    const modifiedRequestOptions = (await options.modifyRequest?.(requestOptions)) ?? requestOptions

    let proxyResponse: IncomingMessage
    for (let attempt = 1; attempt <= 10; ++attempt) {
      try {
        proxyResponse = await send(modifiedRequestOptions)
        if (!(await options.shouldRetry?.(proxyResponse))) break
        logger.error(
          `Attempt (${attempt}) to proxy request finished with unexpected status ${proxyResponse.statusCode}`,
        )
        await utils.general.sleep(options.retryTimeout ?? 5000)
      } catch (error) {
        if (utils.types.instanceOf(error, 'AbortError')) throw error
        logger.error(`Attempt (${attempt}) to proxy request failed with error`, error)
        if (attempt + 1 <= 10) throw error
      }
    }

    if (request.httpVersion === '1.0') {
      proxyResponse.headers.connection = proxyResponse.headers.connection || 'close'
    } else if (request.httpVersion !== '2.0' && !proxyResponse.headers.connection) {
      proxyResponse.headers.connection = request.headers.connection || 'keep-alive'
    }

    response.sendDate = false
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers)

    if (options.handle !== false) proxyResponse.pipe(response)

    return proxyResponse

    async function send(requestOptions: RequestOptions): Promise<IncomingMessage> {
      const sendRequest = new URL(requestOptions.url).protocol === 'https:' ? sendHttps : sendHttp
      return new Promise<IncomingMessage>((resolve, reject) => {
        const request = sendRequest(requestOptions.url, {
          ...requestOptions,
          agent: new ProxyAgent(requestOptions.proxy),
        })

        request.on('error', reject)
        request.on('response', resolve)

        if (requestOptions.body && utils.types.isFunction(requestOptions.body, 'pipe')) {
          requestOptions.body.pipe(request)
        } else {
          request.write(requestOptions.body)
          request.end()
        }
      })
    }
  }
}

function makeResolveUrl() {
  const resolvedHosts = new Map()
  return async function resolve(unresolvedUrl: string | URL, {logger}: {logger: Logger}) {
    const url = new URL(unresolvedUrl)

    let hostname = resolvedHosts.get(url.hostname)
    if (!hostname) {
      hostname = new Promise(resolve => {
        resolveDns(url.hostname, (err, addresses) => {
          if (!err) {
            resolvedHosts.set(url.hostname, addresses[0])
            logger.log(`Addresses were successfully resolved for url ${url.href} - ${addresses.join(', ')}`)
            resolve(addresses[0])
          } else {
            logger.error(`Failed to resolve address for url ${url.href}`, err)
            resolve(url.hostname)
          }
        })
      })
      resolvedHosts.set(url.hostname, hostname)
    }
    url.hostname = await hostname
    return url
  }
}
