import {type AddressInfo} from 'net'
import {type IncomingMessage, type ServerResponse, type Server, createServer} from 'http'
import {type AbortSignal} from 'abort-controller'
import {type Logger, makeLogger} from '@applitools/logger'
import {makeQueue, type Queue} from './queue'
import {makeTunnelManager} from './tunnel'
import {makeProxy} from './proxy'
import {parseBody} from './parse-body'
import * as utils from '@applitools/utils'

export type ServerOptions = {
  egServerUrl?: string
  egTunnelUrl?: string
  egTimeout?: number | string
  egInactivityTimeout?: number | string
  proxyUrl?: string
  eyesServerUrl?: string
  apiKey?: string
  port?: number
  resolveUrls?: boolean
  logger?: Logger
}

const RETRY_BACKOFF = [].concat(
  Array(5).fill(2000), // 5 tries with delay 2s (total 10s)
  Array(4).fill(5000), // 4 tries with delay 5s (total 20s)
  10000, // all next tries with delay 10s
)

const RETRY_ERROR_CODES = ['CONCURRENCY_LIMIT_REACHED', 'NO_AVAILABLE_DRIVER_POD']

export function makeServer({
  egServerUrl = 'https://exec-wus.applitools.com',
  egTunnelUrl = process.env.APPLITOOLS_EG_TUNNEL_URL,
  egTimeout = process.env.APPLITOOLS_EG_TIMEOUT,
  egInactivityTimeout = process.env.APPLITOOLS_EG_INACTIVITY_TIMEOUT,
  proxyUrl = process.env.APPLITOOLS_PROXY,
  eyesServerUrl = process.env.APPLITOOLS_SERVER_URL,
  apiKey = process.env.APPLITOOLS_API_KEY,
  port = 0,
  resolveUrls = true,
  logger,
}: ServerOptions = {}): Promise<{url: string; port: number; server: Server}> {
  logger = logger ? logger.extend({label: 'eg-client'}) : makeLogger({label: 'eg-client', colors: true})

  const proxyRequest = makeProxy({
    url: egServerUrl,
    resolveUrls,
    proxy: proxyUrl,
    shouldRetry: async proxyResponse => {
      if (proxyResponse.statusCode <= 400) return false
      //@ts-ignore
      proxyResponse.body = await parseBody(proxyResponse)
      return !(proxyResponse as any).body?.value
    },
  })
  const {createTunnel, deleteTunnel} = makeTunnelManager({egTunnelUrl, logger})

  const sessions = new Map()
  const queues = new Map<string, Queue>()

  const server = createServer(async (request, response) => {
    const requestLogger = logger.extend({
      tags: {request: `[${request.method}] ${request.url}`, requestId: utils.general.guid()},
    })

    try {
      if (request.method === 'POST' && /^\/session\/?$/.test(request.url)) {
        return await createSession({request, response, logger: requestLogger})
      } else if (request.method === 'DELETE' && /^\/session\/[^\/]+\/?$/.test(request.url)) {
        return await deleteSession({request, response, logger: requestLogger})
      } else {
        requestLogger.log('Passthrough request')
        return await proxyRequest({request, response, logger: requestLogger})
      }
    } catch (err) {
      // console.error(err)
      requestLogger.error(`Error during processing request:`, err)
      response
        .writeHead(500)
        .end(JSON.stringify({value: {error: 'internal proxy server error', message: err.message, stacktrace: ''}}))
    } finally {
      requestLogger.log(`Request was responded with status ${response.statusCode}`)
    }
  })

  server.listen(port)

  return new Promise<{url: string; port: number; server: Server}>((resolve, reject) => {
    server.on('listening', () => {
      const address = server.address() as AddressInfo
      logger.log(`Proxy server has started on port ${address.port}`)
      resolve({url: `http://localhost:${address.port}`, port: address.port, server})
    })
    server.on('error', async (err: Error) => {
      logger.fatal('Error starting proxy server', err)
      reject(err)
    })
  })

  async function createSession({
    request,
    response,
    logger,
  }: {
    request: IncomingMessage
    response: ServerResponse
    logger: Logger
  }): Promise<void> {
    const requestBody = await parseBody(request)

    logger.log(`Request was intercepted with body:`, requestBody)

    const session = {} as any
    session.eyesServerUrl = extractCapability(requestBody, 'applitools:eyesServerUrl') ?? eyesServerUrl
    session.apiKey = extractCapability(requestBody, 'applitools:apiKey') ?? apiKey
    session.tunnelId = extractCapability(requestBody, 'applitools:tunnel') ? await createTunnel(session) : undefined

    const applitoolsCapabilities = {
      'applitools:eyesServerUrl': session.eyesServerUrl,
      'applitools:apiKey': session.apiKey,
      'applitools:x-tunnel-id-0': session.tunnelId,
      'applitools:timeout': extractCapability(requestBody, 'applitools:timeout') ?? egTimeout,
      'applitools:inactivityTimeout':
        extractCapability(requestBody, 'applitools:inactivityTimeout') ?? egInactivityTimeout,
    }

    if (requestBody.capabilities) {
      requestBody.capabilities.alwaysMatch = {...requestBody.capabilities?.alwaysMatch, ...applitoolsCapabilities}
    }
    if (requestBody.desiredCapabilities) {
      requestBody.desiredCapabilities = {...requestBody.desiredCapabilities, ...applitoolsCapabilities}
    }

    logger.log('Request body has modified:', requestBody)

    let queue = queues.get(`${session.eyesServerUrl}:${session.apiKey}`)
    if (!queue) {
      queue = makeQueue({logger})
      queues.set(`${session.eyesServerUrl}:${session.apiKey}`, queue)
    }

    request.socket.on('close', () => queue.cancel(task))

    await queue.run(task)

    async function task(signal: AbortSignal, attempt = 0): Promise<void> {
      // do not start the task if it is already aborted
      if (signal.aborted) return

      const proxyResponse = await proxyRequest({
        request,
        response,
        options: {body: JSON.stringify(requestBody), handle: false, signal},
        logger,
      })

      // to decide if we get an expected response we might already parse the body
      const responseBody = (proxyResponse as any).body ?? (await parseBody(proxyResponse))

      logger.log(`Response was intercepted with body:`, responseBody)

      if (RETRY_ERROR_CODES.includes(responseBody.value?.data?.appliErrorCode)) {
        queue.cork()
        // after query is corked the task might be aborted
        if (signal.aborted) return
        await utils.general.sleep(RETRY_BACKOFF[Math.min(attempt, RETRY_BACKOFF.length - 1)])
        logger.log(`Retrying sending the request (attempt ${attempt})`)
        return task(signal, attempt + 1)
      } else {
        queue.uncork()
        if (responseBody.value?.sessionId) sessions.set(responseBody.value.sessionId, session)
        response.end(JSON.stringify(responseBody))
        return
      }
    }
  }

  async function deleteSession({
    request,
    response,
    logger,
  }: {
    request: IncomingMessage
    response: ServerResponse
    logger: Logger
  }): Promise<void> {
    const sessionId = request.url.split('/').pop()
    logger.log(`Request was intercepted with sessionId:`, sessionId)

    await proxyRequest({request, response, logger})

    const session = sessions.get(sessionId)
    if (session.tunnelId) {
      await deleteTunnel(session)
      logger.log(`Tunnel with id ${session.tunnelId} was deleted for session with id ${sessionId}`)
    }
    sessions.delete(sessionId)
  }

  function extractCapability(
    data: {
      desiredCapabilities?: Record<string, any>
      capabilities?: {alwaysMatch?: Record<string, any>; firstMatch?: Record<string, any>[]}
    },
    capabilityName: string,
  ): any {
    return data.capabilities?.alwaysMatch?.[capabilityName] ?? data.desiredCapabilities?.[capabilityName]
  }
}
