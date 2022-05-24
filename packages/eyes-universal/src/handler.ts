import {Server as HttpServer, request as httpRequest} from 'http'
import {Server as HttpsServer, request as httpsRequest} from 'https'
import {Server as WsServer} from 'ws'
import fs from 'fs'

const {name, version} = require('../package.json')
const TOKEN_HEADER = 'x-eyes-universal-token'
const TOKEN = `${name}@${version}`

export type HandlerOptions = {
  port?: number
  singleton?: boolean
  lazy?: boolean
  debug?: boolean
  key?: string | Buffer
  cert?: string | Buffer
}

export async function makeHandler({
  port = 21077,
  singleton = true,
  lazy = false,
  debug = false,
  cert,
  key,
}: HandlerOptions = {}): Promise<{server?: WsServer; port: number}> {
  if (cert) cert = fs.readFileSync(cert)
  if (key) key = fs.readFileSync(key)
  const secure = Boolean(cert && key)

  const http = secure ? new HttpsServer({cert, key}) : new HttpServer()
  http.on('request', (request, response) => {
    if (request.url === '/handshake') {
      const token = debug ? request.headers[TOKEN_HEADER] : TOKEN
      if (request.headers[TOKEN_HEADER] === token) {
        response.writeHead(200, {[TOKEN_HEADER]: token})
      } else {
        response.writeHead(400)
      }
      response.end()
    }
  })

  http.listen(port, 'localhost')

  return new Promise((resolve, reject) => {
    http.on('listening', () => {
      const ws = new WsServer({server: http, path: '/eyes'})
      ws.on('close', () => http.close())
      resolve({server: ws, port})
    })

    http.on('error', async (err: Error & {code: string}) => {
      if (!lazy && err.code === 'EADDRINUSE') {
        if (singleton && (await isHandshakable({port, secure}))) {
          return resolve({port})
        } else {
          return resolve(await makeHandler({port: port + 1, singleton}))
        }
      }
      reject(err)
    })
  })
}

async function isHandshakable({port, secure}: {port: number; secure?: boolean}): Promise<boolean> {
  const request = secure ? httpsRequest : httpRequest
  return new Promise(resolve => {
    const handshake = request(`${secure ? 'https' : 'http'}://localhost:${port}/handshake`, {
      headers: {[TOKEN_HEADER]: TOKEN},
    })
    handshake.on('response', ({statusCode, headers}) => {
      resolve(statusCode === 200 && headers[TOKEN_HEADER] === TOKEN)
    })
    handshake.on('error', () => resolve(false))
    handshake.end()
  })
}
