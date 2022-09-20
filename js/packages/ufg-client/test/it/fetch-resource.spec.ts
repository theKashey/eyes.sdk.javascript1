import {makeFetchResource} from '../../src/fetch-resource'
import {makeResource} from '../../src/resource'
import {testServer} from '@applitools/test-server'
import assert from 'assert'

describe('fetch-resource', () => {
  let server

  before(async () => {
    server = await testServer({
      cert: './test/fixtures/certificate.pem',
      key: './test/fixtures/key.pem',
      port: 12345,
    })
  })

  after(async () => {
    await server.close()
  })

  it('works with a self-signed certificate', async () => {
    const fetchResource = makeFetchResource({retryLimit: 0})
    const resource = await fetchResource({resource: makeResource({url: `https://localhost:${server.port}/page/smurfs.jpg`})})
    assert.strictEqual((resource.hash as any).contentType, 'image/jpeg')
  })
})
