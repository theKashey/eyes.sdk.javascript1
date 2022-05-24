import WebSocket from 'ws'
import {makeServer} from '../../src'

describe('universal-server', () => {
  it('starts server in secure mode', async () => {
    const server = await makeServer({cert: './test/fixtures/test.cert', key: './test/fixtures/test.key'})
    const ws = new WebSocket(`wss://localhost:${server.port}/eyes`, {rejectUnauthorized: false})

    try {
      await new Promise((resolve, reject) => {
        ws.on('open', resolve)
        ws.on('close', reject)
        ws.on('error', reject)
      })
    } finally {
      ws.close()
      server.close()
    }
  })
})
