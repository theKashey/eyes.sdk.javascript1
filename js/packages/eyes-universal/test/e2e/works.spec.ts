import {spawn, fork} from 'child_process'
import fs from 'fs'

describe('works', () => {
  it('works with stdout', async () => {
    let platform
    if (process.platform === 'darwin') {
      platform = 'macos'
    } else if (process.platform === 'win32') {
      platform = 'win'
    } else if (process.platform === 'linux') {
      if (fs.existsSync('/etc/alpine-release')) {
        platform = 'alpine'
      } else {
        platform = 'linux'
      }
    }
    const server = spawn(`./bin/eyes-universal-${platform}`, {
      detached: true,
      shell: process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : '/bin/sh',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return new Promise<void>((resolve, reject) => {
      server.on('error', reject)

      const timeout = setTimeout(() => reject(new Error('No output from the server for 20 seconds')), 20000)
      server.stdout.once('data', data => {
        clearTimeout(timeout)
        const [firstLine] = String(data).split('\n', 1)
        if (Number.isInteger(Number(firstLine))) {
          resolve()
        } else {
          reject(new Error(`Server first line of stdout output expected to be a port, but got "${firstLine}"`))
        }
      })
    }).finally(() => server.kill())
  })

  it('works with ipc', async () => {
    const server = fork(`./dist/cli.js`, {detached: true, stdio: 'ignore'})
    return new Promise<void>((resolve, reject) => {
      server.on('error', reject)

      const timeout = setTimeout(() => reject(new Error('No output from the server for 20 seconds')), 20000)
      server.on('message', (data: any) => {
        clearTimeout(timeout)
        if (data.name === 'port' && Number.isInteger(data.payload.port)) {
          resolve()
        } else {
          reject(new Error(`Server first message expected to be a port, but got "${JSON.stringify(data)}"`))
        }
      })
    }).finally(() => server.kill())
  })
})
