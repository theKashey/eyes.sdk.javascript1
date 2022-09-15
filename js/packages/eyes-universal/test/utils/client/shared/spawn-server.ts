import type {ChildProcess, SpawnOptionsWithStdioTuple, StdioPipe, StdioNull} from 'child_process'
import {spawn} from 'child_process'
import path from 'path'
import {Socket} from './socket'
import type {Logger} from '@applitools/logger'
import {Readable} from 'stream'
type ReadableWithRef = Readable & {unref: () => void}
export type CliType = 'npm_local' | 'npx'

export interface SpawnedServer {
  server: ChildProcess
  socket: Socket
}

export default function startServer({logger, cliType}: {logger: Logger; cliType: CliType}): Promise<SpawnedServer> {
  const eyesUniversalArgs: Array<string> = ['--shutdown-mode', 'stdin']
  const spawnOptions: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioNull> = {
    detached: true,
    stdio: ['pipe', 'pipe', 'ignore'],
  }
  const server: ChildProcess = spawn('node', ['./dist/cli.js'].concat(eyesUniversalArgs), spawnOptions)
  const {spawnfile, spawnargs, pid} = server
  logger.log(`cli detail's`, {spawnfile, spawnargs, pid})
  const socket = new Socket()
  server.unref()
  socket.unref()

  logger.log('wait for the server to response with port to connect')
  return new Promise((resolve, reject) => {
    server.stdout.once('data', data => {
      ;(server.stdout as ReadableWithRef).unref()
      let port: string
      // TODO:
      // i don't like it, i think we should find a better way to pass the port through the child process `stdin`
      try {
        port = data.toString().match(/\d+/)[0]
      } catch (e) {
        logger.error('could not parse the port input')
        reject('could not parse the port input')
      }
      logger.log('server is spawned at port', port)
      socket.connect(`http://localhost:${port}/eyes`)
      socket.emit('Core.makeSDK', {
        name: 'eyes-universal-tests',
        version: require(path.resolve(process.cwd(), 'package.json')).version,
        protocol: 'webdriver',
        cwd: process.cwd(),
      })

      logger.log('resolving the server and the socket')
      resolve({server: server, socket})
    })
  })
}
