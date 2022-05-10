import {type IncomingMessage, type ServerResponse} from 'http'
import {createProxy} from 'http-proxy'
import {Readable} from 'stream'

type ProxyOptions = {
  target: string
  handle?: boolean
  body?: Record<string, any>
  headers?: Record<string, string>
}

// TODO: get rid of http-proxy library

export async function proxy(
  request: IncomingMessage,
  response: ServerResponse,
  options: ProxyOptions,
): Promise<IncomingMessage> {
  const proxy = createProxy()
  return new Promise((resolve, reject) => {
    const content = options.body ? JSON.stringify(options.body) : undefined
    const settings = {
      target: options.target,
      selfHandleResponse: options.handle,
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
      headers: content
        ? {...options.headers, 'Content-Length': Buffer.byteLength(content).toString()}
        : options.headers,
    }

    // prevent modification of the request headers in the http-proxy library
    Object.freeze(request.headers)

    proxy.on('proxyRes', proxyResponse => resolve(proxyResponse))
    proxy.web(request, response, settings, reject)
  })
}
