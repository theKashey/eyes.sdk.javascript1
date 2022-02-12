import {fork} from 'child_process'
import path from 'path'

export function makeServerProcess(config: any) {
  return new Promise((resolve, reject) => {
    const server = fork(path.resolve(__dirname, '../dist/cli.js'), [`--config ${JSON.stringify(config)}`], {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    })

    const timeout = setTimeout(() => {
      reject(new Error(`Server didn't respond for 10s after being started`))
      server.kill()
    }, 10000)

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
