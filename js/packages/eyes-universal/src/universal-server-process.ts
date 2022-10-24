import {type ServerOptions} from './universal-server'
import {fork, type ForkOptions} from 'child_process'
import path from 'path'

export function makeServerProcess(
  options: ServerOptions & {forkOptions?: ForkOptions},
): Promise<{port: number; close: () => void}> {
  return new Promise((resolve, reject) => {
    const {forkOptions} = options
    const server = fork(path.resolve(__dirname, '../dist/cli.js'), [`--config=${JSON.stringify(options)}`], {
      stdio: [options.shutdownMode === 'stdin' ? 'inherit' : 'ignore', 'ignore', 'ignore', 'ipc'],
      ...(forkOptions ?? {}),
    })

    const timeout = setTimeout(() => {
      reject(new Error(`Server didn't respond for 10s after being started`))
      server.kill()
    }, 60000)

    server.on('error', reject)

    server.once('message', ({name, payload}: {name: string; payload: any}) => {
      if (name === 'port') {
        resolve({port: payload.port, close: () => server.kill()})
        clearTimeout(timeout)
        server.channel.unref()
      }
    })

    server.unref()
  })
}
