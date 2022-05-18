import assert from 'assert'
import {createServer as createHttpServer, Server as HttpServer} from 'http'
import fetch from 'node-fetch'
import {makeLogger} from '@applitools/logger'
import {modifyIncomingMessage, type ModifiedIncomingMessage} from '../../src/incoming-message'
import {makeProxy} from '../../src/proxy'

describe('proxy', () => {
  const logger = makeLogger()

  async function createServer({port}: {port: number}): Promise<HttpServer> {
    return new Promise((resolve, reject) => {
      const server = createHttpServer().listen(port, 'localhost')
      server.on('listening', () => resolve(server))
      server.on('error', reject)
    })
  }

  it('works with http target', async () => {
    return new Promise<void>(async (resolve, reject) => {
      const proxyRequest = makeProxy()
      const server = await createServer({port: 3000})
      const proxyServer = await createServer({port: 4000})
      try {
        const headers = {original: null as any, proxied: null as any}

        server.on('request', (request, response) => {
          if (request.method === 'POST' && request.url === '/path') {
            headers.proxied = request.headers
            response.sendDate = false
            response
              .writeHead(200, {'x-header': 'value', 'Content-Type': 'application/json; charset=utf-8'})
              .end(JSON.stringify({value: true}))
          } else {
            response.writeHead(500).end()
          }
        })

        proxyServer.on('request', async (message: ModifiedIncomingMessage, response) => {
          const request = modifyIncomingMessage(message)
          try {
            headers.original = request.headers
            await proxyRequest({request, response, options: {url: 'http://localhost:3000'}, logger})
          } catch (err) {
            reject(err)
          }
        })

        const response = await fetch('http://localhost:4000/path', {method: 'post'})

        assert.strictEqual(response.status, 200)
        assert.strictEqual(response.headers.get('x-header'), 'value')
        assert.deepStrictEqual(await response.json(), {value: true})
        assert.deepStrictEqual(headers.proxied, {...headers.original, host: 'localhost:3000'})
        resolve()
      } catch (err) {
        reject(err)
      } finally {
        server.close()
        proxyServer.close()
      }
    })
  })

  it('works with second proxy', async () => {
    return new Promise<void>(async (resolve, reject) => {
      const proxyRequest = makeProxy()
      const server = await createServer({port: 3000})
      const secondProxyServer = await createServer({port: 4000})
      const proxyServer = await createServer({port: 5000})
      try {
        const headers = {original: null as any, proxied: null as any, doubleProxied: null as any}

        server.on('request', (request, response) => {
          if (request.method === 'POST' && request.url === '/path') {
            headers.doubleProxied = request.headers
            response.sendDate = false
            response
              .writeHead(200, {'x-header': 'value', 'Content-Type': 'application/json; charset=utf-8'})
              .end(JSON.stringify({value: true}))
          } else {
            response.writeHead(500).end()
          }
        })

        secondProxyServer.on('request', async (message: ModifiedIncomingMessage, response) => {
          const request = modifyIncomingMessage(message)
          try {
            headers.proxied = request.headers
            await proxyRequest({request, response, logger})
          } catch (err) {
            reject(err)
          }
        })

        proxyServer.on('request', async (message, response) => {
          const request = modifyIncomingMessage(message)
          try {
            headers.original = request.headers
            await proxyRequest({
              request,
              response,
              options: {url: 'http://localhost:3000', proxy: 'http://localhost:4000'},
              logger,
            })
          } catch (err) {
            reject(err)
          }
        })

        const response = await fetch('http://localhost:5000/path', {method: 'post'})

        assert.strictEqual(response.status, 200)
        assert.strictEqual(response.headers.get('x-header'), 'value')
        assert.deepStrictEqual(await response.json(), {value: true})
        assert.deepStrictEqual(headers.proxied, {...headers.original, host: 'localhost:3000'})
        assert.deepStrictEqual(headers.doubleProxied, {...headers.original, host: 'localhost:3000'})
        resolve()
      } catch (err) {
        reject(err)
      } finally {
        server.close()
        proxyServer.close()
        secondProxyServer.close()
      }
    })
  })

  it('retries with body', async () => {
    return new Promise<void>(async (resolve, reject) => {
      const proxyRequest = makeProxy({shouldRetry: response => response.statusCode >= 400, retryTimeout: 0})
      const server = await createServer({port: 3000})
      const proxyServer = await createServer({port: 4000})
      try {
        let requestCount = 0
        server.on('request', async (message, response) => {
          const request = modifyIncomingMessage(message)
          if (requestCount < 5) {
            requestCount += 1
            response.writeHead(500).end()
          } else {
            response.writeHead(200, {'Content-Type': request.headers['content-type']}).end(await request.body())
          }
        })

        proxyServer.on('request', async (message, response) => {
          const request = modifyIncomingMessage(message)
          try {
            await proxyRequest({request, response, options: {url: 'http://localhost:3000'}, logger})
          } catch (err) {
            reject(err)
          }
        })

        const body = {value: true}

        const response = await fetch('http://localhost:4000/path', {method: 'post', body: JSON.stringify(body)})

        assert.strictEqual(response.status, 200)
        assert.deepStrictEqual(await response.json(), body)
        resolve()
      } catch (err) {
        reject(err)
      } finally {
        server.close()
        proxyServer.close()
      }
    })
  })

  it('respond on failed requests with body', async () => {
    return new Promise<void>(async (resolve, reject) => {
      const proxyRequest = makeProxy({
        shouldRetry: async response => response.statusCode >= 400 && (await response.json())?.error,
        retryTimeout: 0,
      })
      const server = await createServer({port: 3000})
      const proxyServer = await createServer({port: 4000})
      try {
        server.on('request', async (_, response) => response.writeHead(404).end(JSON.stringify({error: 'blabla'})))

        proxyServer.on('request', async (message, response) => {
          const request = modifyIncomingMessage(message)
          try {
            await proxyRequest({request, response, options: {url: 'http://localhost:3000'}, logger})
          } catch (err) {
            reject(err)
          }
        })

        const response = await fetch('http://localhost:4000/path')

        assert.strictEqual(response.status, 404)
        assert.deepStrictEqual(await response.json(), {error: 'blabla'})
        resolve()
      } catch (err) {
        reject(err)
      } finally {
        server.close()
        proxyServer.close()
      }
    })
  })
})
