import {createServer} from 'http'
import {createProxy} from 'http-proxy'
import {createConnection} from 'net'

export function startProxyServer(port = 12345) {
  const proxy = createProxy()

  const server = createServer(function (req, res) {
    console.log('[proxy server] Receiving reverse proxy request for:', req.url)
    const parsedUrl = new URL(req.url as string)
    const target = parsedUrl.protocol + '//' + parsedUrl.hostname
    proxy.web(req, res, {target: target, secure: false})
  })

  server.on('connect', function (req, socket) {
    console.log('[proxy server (connect event)] Receiving reverse proxy request for:', req.url)

    const serverUrl = new URL('http://' + req.url)

    const srvSocket = createConnection(Number(serverUrl.port), serverUrl.hostname, function () {
      socket.write('HTTP/1.1 200 Connection Established\r\n' + 'Proxy-agent: Node-Proxy\r\n' + '\r\n')
      srvSocket.pipe(socket)
      socket.pipe(srvSocket)
    })

    srvSocket.on('error', err => {
      console.log(err.message)
    })
  })

  return new Promise(resolve => {
    server.listen(port, () => {
      console.log('[proxy server] listening on port', port)
      const close = () => server.close()
      resolve({port, close})
    })
  })
}
