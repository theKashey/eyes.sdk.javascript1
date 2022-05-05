import nock from 'nock'
import assert from 'assert'
import {makeLogger} from '@applitools/logger'
import {makeTunnelManager} from '../../src/tunnel'

describe('tunnel', () => {
  afterEach(async () => {
    nock.cleanAll()
  })

  it('creates new tunnel', async () => {
    const {createTunnel} = await makeTunnelManager({tunnelUrl: 'http://eg-tunnel', logger: makeLogger()})

    nock('http://eg-tunnel').persist().post('/tunnels').reply(201, '"tunnel-id"')

    const tunnelId = await createTunnel({apiKey: 'api-key'})

    assert.strictEqual(tunnelId, 'tunnel-id')
  })

  it('creates new tunnel with retries', async () => {
    const {createTunnel} = await makeTunnelManager({tunnelUrl: 'http://eg-tunnel', logger: makeLogger()})

    let retries = 0
    nock('http://eg-tunnel')
      .persist()
      .post('/tunnels')
      .reply(() => {
        retries += 1
        if (retries <= 2) {
          return [
            retries === 1 ? 403 : 503,
            {message: retries === 1 ? 'CONCURRENCY_LIMIT_REACHED' : 'NO_AVAILABLE_TUNNEL_PROXY'},
          ]
        }
        return [201, '"tunnel-id"']
      })

    const tunnelId = await createTunnel({apiKey: 'api-key'})

    assert.strictEqual(tunnelId, 'tunnel-id')
  })

  it('creates new tunnel with api key and server url', async () => {
    const {createTunnel} = await makeTunnelManager({tunnelUrl: 'http://eg-tunnel', logger: makeLogger()})

    nock('http://eg-tunnel')
      .persist()
      .post('/tunnels')
      .reply(function () {
        const apiKeyHeader = this.req.headers['x-eyes-api-key'][0]
        const serverUrlHeader = this.req.headers['x-eyes-server-url']?.[0]
        if (apiKeyHeader === 'api-key' && (!serverUrlHeader || serverUrlHeader === 'http://server.url')) {
          return [201, `"tunnel-id-${serverUrlHeader ? 2 : 1}"`]
        }
        return [401, {message: 'UNAUTHORIZED'}]
      })

    const tunnelIdFirst = await createTunnel({apiKey: 'api-key'})

    assert.strictEqual(tunnelIdFirst, 'tunnel-id-1')

    const tunnelIdSecond = await createTunnel({apiKey: 'api-key', serverUrl: 'http://server.url'})

    assert.strictEqual(tunnelIdSecond, 'tunnel-id-2')
  })

  it('throws when tunnel was not created', async () => {
    const {createTunnel} = await makeTunnelManager({tunnelUrl: 'http://eg-tunnel', logger: makeLogger()})

    nock('http://eg-tunnel').persist().post('/tunnels').reply(401, {message: 'UNAUTHORIZED'})

    assert.rejects(createTunnel({apiKey: 'api-key'}), (err: Error) => err.message.includes('UNAUTHORIZED'))
  })

  it('deletes tunnel', async () => {
    const {deleteTunnel} = await makeTunnelManager({tunnelUrl: 'http://eg-tunnel', logger: makeLogger()})

    nock('http://eg-tunnel').persist().delete('/tunnels/tunnel-id').reply(200)

    await deleteTunnel({tunnelId: 'tunnel-id', apiKey: 'api-key'})
  })

  it('deletes tunnel with api key and server url', async () => {
    const {deleteTunnel} = await makeTunnelManager({tunnelUrl: 'http://eg-tunnel', logger: makeLogger()})

    nock('http://eg-tunnel')
      .persist()
      .delete('/tunnels/tunnel-id')
      .reply(function () {
        const apiKeyHeader = this.req.headers['x-eyes-api-key'][0]
        const serverUrlHeader = this.req.headers['x-eyes-server-url']?.[0]
        if (apiKeyHeader === 'api-key' && (!serverUrlHeader || serverUrlHeader === 'http://server.url')) {
          return [200]
        }
        return [401, {message: 'UNAUTHORIZED'}]
      })

    await deleteTunnel({tunnelId: 'tunnel-id', apiKey: 'api-key'})

    await deleteTunnel({
      tunnelId: 'tunnel-id',
      apiKey: 'api-key',
      serverUrl: 'http://server.url',
    })
  })

  it('throws when tunnel was not deleted', async () => {
    const {deleteTunnel} = await makeTunnelManager({tunnelUrl: 'http://eg-tunnel', logger: makeLogger()})

    nock('http://eg-tunnel').persist().post('/tunnels/tunnel-id').reply(404, {message: 'TUNNEL_NOT_FOUND'})

    assert.rejects(deleteTunnel({tunnelId: 'tunnel-id', apiKey: 'api-key'}), (err: Error) =>
      err.message.includes('TUNNEL_NOT_FOUND'),
    )
  })
})
