import {Server as HTTPServer, request} from 'http'
import {Server as WSServer} from 'ws'

const {name, version} = require('../../package.json') // TODO is the handshake needed at all?
const TOKEN_HEADER = 'x-eyes-universal-token'
const TOKEN = `${name}@${version}`

// TODO make default port 0 and return actual port
export async function makeHandler({port = 31077, singleton = true, lazy = false} = {}): Promise<{
  server?: WSServer
  port: number
}> {
  const http = new HTTPServer()
  http.on('request', (request, response) => {
    if (request.url === '/handshake') {
      if (request.headers[TOKEN_HEADER] === TOKEN) {
        response.writeHead(200, {[TOKEN_HEADER]: TOKEN})
      } else {
        response.writeHead(400)
      }
      response.end()
    }
  })

  http.listen(port, 'localhost')

  return new Promise((resolve, reject) => {
    http.on('listening', () => {
      const ws = new WSServer({server: http, path: '/eyes'})
      ws.on('close', () => http.close())
      resolve({server: ws, port})
    })

    http.on('error', async (err: Error & {code: string}) => {
      if (!lazy && err.code === 'EADDRINUSE') {
        if (singleton && (await isHandshakable(port))) {
          return resolve({port})
        } else {
          return resolve(await makeHandler({port: port + 1, singleton}))
        }
      }
      reject(err)
    })
  })
}

async function isHandshakable(port: number) {
  return new Promise(resolve => {
    const handshake = request(`http://localhost:${port}/handshake`, {
      headers: {[TOKEN_HEADER]: TOKEN},
    })
    handshake.on('response', ({statusCode, headers}) => {
      resolve(statusCode === 200 && headers[TOKEN_HEADER] === TOKEN)
    })
    handshake.on('error', () => resolve(false))
    handshake.end()
  })
}
