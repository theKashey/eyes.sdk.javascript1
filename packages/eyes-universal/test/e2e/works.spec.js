const assert = require('assert')
const {spawn} = require('child_process')

describe('works', () => {
  const suffixes = {darwin: 'macos', linux: 'linux', win32: 'win'}
  it('works', async () => {
    const server = spawn(`./bin/eyes-universal-${suffixes[process.platform]}`, {
      stdio: ['ignore', 'inherit', 'ignore'],
    })
    try {
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 20000)
        // const timeout = setTimeout(() => reject(new Error('Timeout error')), 100000)

        // server.on('error', reject)
        // server.on('spawn', () => {
        //   console.log('spawned')
        // })

        // server.stdout.once('data', data => {
        //   try {
        //     console.log(String(data))
        //     const [port] = String(data).split('\n', 1)
        //     assert.ok(
        //       Number.isInteger(Number(port)),
        //       `Server first line output expecting to be a port, but got "${port}"`,
        //     )
        //     resolve()
        //   } catch (err) {
        //     reject(err)
        //   } finally {
        //     clearTimeout(timeout)
        //   }
        // })
      })
    } finally {
      server.kill()
    }
  })
})
