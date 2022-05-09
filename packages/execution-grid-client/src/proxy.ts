import {type IncomingMessage, type ServerResponse} from 'http'
import {createProxy} from 'http-proxy'
import {Readable} from 'stream'

type ProxyOptions = {
  target: string
  handle?: boolean
  body?: Record<string, any>
  headers?: Record<string, string>
}

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
    proxy.web(request, response, settings, reject)
    proxy.on('proxyRes', resolve)
  })
}
