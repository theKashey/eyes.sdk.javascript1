import './http-extension'

import {type AddressInfo} from 'net'
import {type IncomingMessage, type ServerResponse, type Server, createServer} from 'http'
import {proxy} from './proxy'
import parseBody from 'raw-body'
import {type Logger, makeLogger} from '@applitools/logger'
import * as utils from '@applitools/utils'

export type ProxyServerOptions = {
  port?: number
  forwardingUrl?: string
  tunnelUrl?: string
  serverUrl?: string
  apiKey?: string
  logger?: Logger & any
}

const RETRY_BACKOFF = [].concat(
  Array(5).fill(2000), // 5 tries with delay 2s (total 10s)
  Array(4).fill(5000), // 4 tries with delay 5s (total 20s)
  10000, // all next tries with delay 10s
)

const RETRY_ERROR_CODES = ['CONCURRENCY_LIMIT_REACHED', 'NO_AVAILABLE_DRIVER_POD']

export function makeServer({
  port = 0,
  forwardingUrl = 'https://exec-wus.applitools.com',
  tunnelUrl,
  serverUrl = process.env.APPLITOOLS_SERVER_URL,
  apiKey = process.env.APPLITOOLS_API_KEY,
  logger,
}: ProxyServerOptions = {}): Promise<{url: string; port: number; server: Server}> {
  logger = logger ? logger.extend({label: 'eg-client'}) : makeLogger({label: 'eg-client', colors: true})

  const server = createServer(async (request, response) => {
    if (request.method === 'POST' && request.url === '/session') {
      return handleNewSession(request, response)
    } else if (request.method === 'DELETE' && request.url === '/session/sessionID') {
      // return handleStopSession(request, response)
    } else {
      return proxy(request, response, {target: forwardingUrl, forward: true})
    }
  })

  server.listen(port, 'localhost')

  return new Promise<{url: string; port: number; server: Server}>((resolve, reject) => {
    server.on('listening', () => {
      const address = server.address() as AddressInfo
      logger.log(`Proxy server has started on port ${address.port}`)
      resolve({url: `http://localhost:${address.port}`, port: address.port, server})
    })
    server.on('error', async (err: Error) => {
      logger.fatal('Error starting proxy server')
      logger.fatal(err)
      reject(err)
    })
  })

  async function handleNewSession(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const state = {} as any
    const requestLogger = logger.extend({
      tags: {signature: `[${request.method}]${request.url}`, requestId: utils.general.guid()},
    })

    const requestBody = await parseBody(request, 'utf-8').then(body => (body ? JSON.parse(body) : undefined))
    if (!requestBody) return requestLogger.log(`Request has no body`)

    requestLogger.log(`Request was intercepted with body:`, requestBody)

    const capabilities = requestBody.capabilities?.alwaysMatch ?? requestBody.desiredCapabilities
    state.serverUrl = capabilities['applitools:eyesServerUrl'] = capabilities['applitools:eyesServerUrl'] ?? serverUrl
    state.apiKey = capabilities['applitools:apiKey'] = capabilities['applitools:apiKey'] ?? apiKey
    if (capabilities['applitools:tunnel']) {
      const tunnelId = await fetch(`${tunnelUrl}/tunnels`, {
        method: 'POST',
        headers: {'x-eyes-server-url': state.serverUrl, 'x-eyes-api-key': state.apiKey},
      }).then(response => response.json())
      state.tunnelId = capabilities['applitools:x-tunnel-id-0'] = tunnelId
    }

    requestLogger.log('Request body has modified:', requestBody)

    let attempt = 0
    while (true) {
      const proxyResponse = await proxy(request, response, {target: forwardingUrl, body: requestBody})

      const responseBody = await parseBody(proxyResponse, 'utf-8').then(body => (body ? JSON.parse(body) : undefined))

      if (!responseBody) {
        response.writeHead(proxyResponse.statusCode, proxyResponse.headers).end()
        return requestLogger.log(`Response has no body`)
      }

      requestLogger.log(`Response was intercepted with body:`, responseBody)

      if (!RETRY_ERROR_CODES.includes(responseBody.value?.data?.appliErrorCode)) {
        response.writeHead(proxyResponse.statusCode, proxyResponse.headers).end(JSON.stringify(responseBody))
        return
      }
      await utils.general.sleep(RETRY_BACKOFF[Math.min(attempt, RETRY_BACKOFF.length - 1)])
      attempt += 1
      request.removeAllListeners()
      requestLogger.log(`Retrying sending the request (attempt ${attempt})`)
    }
  }
}
