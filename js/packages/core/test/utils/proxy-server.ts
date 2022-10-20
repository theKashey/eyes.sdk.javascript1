import {makeLogger, type Logger} from '@applitools/logger'
import * as http from 'http'
import * as https from 'https'
import * as net from 'net'
import * as pem from 'pem'

// This should eventually go to `test-server` package
export async function makeProxyServer({logger}: {logger?: Logger} = {}) {
  logger = logger?.extend({label: 'proxy-server'}) ?? makeLogger({label: 'proxy-server'})

  const proxyServer = await makeServer()

  proxyServer.on('request', (request, response) => {
    const proxyRequest = https.request(request.url, {
      method: request.method,
      headers: request.headers,
    })

    proxyRequest.on('response', proxyResponse => {
      response.writeHead(proxyResponse.statusCode, proxyResponse.headers)
      proxyResponse.pipe(response)
    })

    proxyRequest.on('error', err => {
      logger.error(err)
    })

    request.pipe(proxyRequest)
  })

  proxyServer.on('connect', (_, clientSocket, head) => {
    const serverSocket = net.createConnection(getPort(spoofingServer), 'localhost', function () {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
      serverSocket.write(head)
      serverSocket.pipe(clientSocket)
      clientSocket.pipe(serverSocket)
    })

    serverSocket.once('end', () => {
      clientSocket.destroy()
    })

    serverSocket.on('error', err => {
      logger.error(err.message)
    })
  })

  const authority = await makeCertificate({days: 1, selfSigned: true})
  const spoofingServer = await makeServer({
    key: authority.serviceKey,
    cert: authority.certificate,
  })

  spoofingServer.on('request', (request, response) => {
    const proxyRequest = http.request({
      host: 'localhost',
      port: getPort(proxyServer),
      method: request.method,
      path: `https://${request.headers.host}${request.url}`,
      headers: request.headers,
    })

    proxyRequest.on('response', proxyResponse => {
      response.writeHead(proxyResponse.statusCode, proxyResponse.headers)
      proxyResponse.pipe(response)
    })

    proxyRequest.on('error', err => {
      logger.error(err)
    })

    request.pipe(proxyRequest)
  })

  return {
    server: proxyServer,
    port: getPort(proxyServer),
    close: () => {
      proxyServer.close()
      spoofingServer.close()
    },
  }
}

async function makeCertificate(options?: pem.CertificateCreationOptions): Promise<pem.CertificateCreationResult> {
  return new Promise((resolve, reject) => {
    pem.createCertificate(options, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

async function makeServer<TOptions extends Record<string, any>>(
  options?: TOptions,
): Promise<TOptions extends https.ServerOptions ? https.Server : http.Server> {
  const secure = Boolean(options?.cert && options?.key)
  const server = secure ? https.createServer(options) : http.createServer()

  return new Promise((resolve, reject) => {
    server.listen(0)
    server.on('listening', () => resolve(server as any))
    server.on('error', reject)
  })
}

function getPort(server: net.Server): number {
  return (server.address() as net.AddressInfo).port
}
