import {spawn, fork} from 'child_process'
import fs from 'fs'

describe('works', () => {
  let bin
  if (process.platform === 'darwin') {
    bin = './bin/eyes-universal-macos'
  } else if (process.platform === 'win32') {
    bin = './bin/eyes-universal-win'
  } else if (process.platform === 'linux') {
    bin = `./bin/eyes-universal-${fs.existsSync('/etc/alpine-release') ? 'alpine' : 'linux'}`
  }

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

  it('works with stdout', async () => {
    const server = spawn(process.platform === 'win32' ? bin : `chmod +x ${bin} && ${bin}`, {
      detached: true,
      shell: process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : '/bin/sh',
      stdio: ['ignore', 'pipe', 'inherit'],
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

  it('ends with stdin', async () => {
    const server = spawn(process.platform === 'win32' ? bin : `chmod +x ${bin} && ${bin} --shutdown stdin`, {
      detached: true,
      shell: process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : '/bin/sh',
      stdio: ['pipe', 'inherit', 'inherit'],
    })
    return new Promise<void>((resolve, reject) => {
      server.on('error', reject)
      setTimeout(() => reject(new Error('No output from the server for 20 seconds')), 20000)
      server.on('exit', resolve)
      server.on('close', resolve)

      server.stdin.end()
    }).finally(() => server.kill())
  })
})
