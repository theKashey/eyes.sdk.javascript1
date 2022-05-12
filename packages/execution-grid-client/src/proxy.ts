import {type IncomingMessage, type ServerResponse} from 'http'
import {type Logger} from '@applitools/logger'
import {Readable} from 'stream'
import {createProxy} from 'http-proxy'
import parseBody from 'raw-body'
import * as utils from '@applitools/utils'

type ProxyOptions = {
  target: string
  handle?: boolean
  body?: Record<string, any>
  headers?: Record<string, string>
}

// TODO: get rid of http-proxy library

export async function proxy({
  request,
  response,
  options,
  logger,
}: {
  request: IncomingMessage
  response: ServerResponse
  options: ProxyOptions
  logger: Logger
}): Promise<IncomingMessage> {
  const proxy = createProxy()
  const content = options.body ? JSON.stringify(options.body) : undefined
  const settings = {
    target: options.target,
    selfHandleResponse: true,
    ws: true,
    changeOrigin: true,
    buffer: content
      ? new Readable({
          read() {
            this.push(content)
            this.push(null)
          },
        })
      : undefined,
    headers: content ? {...options.headers, 'Content-Length': Buffer.byteLength(content).toString()} : options.headers,
  }

  return new Promise((resolve, _reject) => {
    // prevent modification of the request headers in the http-proxy library
    Object.freeze(request.headers)

    proxy.on('proxyRes', async proxyResponse => {
      let responseBody
      if (proxyResponse.statusCode >= 400) {
        const rawBody = await parseBody(proxyResponse, 'utf-8')
        try {
          responseBody = rawBody ? JSON.parse(rawBody) : undefined
        } catch {
          responseBody = null
        }
        if (!responseBody?.value) {
          logger.error(`Request respond with unexpected status and body (status ${proxyResponse.statusCode})`, rawBody)
          logger.log(`Retry on a network error`)
          retry()
          return
        }
      }

      if (!options.handle) {
        response.writeHead(proxyResponse.statusCode, proxyResponse.headers)
        if (responseBody) response.end(JSON.stringify(responseBody))
        else proxyResponse.pipe(response)
      }

      // @ts-ignore
      proxyResponse.body = responseBody

      resolve(proxyResponse)
    })
    proxy.web(request, response, settings, err => {
      logger.error(`Unexpected error during proxying`, err)
      logger.log(`Retry on a unxpected error`)
      retry()
    })
  })

  async function retry() {
    await utils.general.sleep(3000)
    proxy.web(request, response, settings, err => {
      logger.error(`Unexpected error during proxying`, err)
      logger.log(`Retry on a unxpected error`)
      retry()
    })
  }
}
