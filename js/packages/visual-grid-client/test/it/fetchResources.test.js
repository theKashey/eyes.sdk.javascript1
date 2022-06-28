/* global fetch */
/* eslint-disable node/no-unsupported-features/node-builtins */
require('@applitools/isomorphic-fetch')
const {expect} = require('chai')
const makeFetchResource = require('../../src/sdk/resources/fetchResource')
const logger = require('../util/testLogger')
const {testServer} = require('@applitools/test-server')

describe('fetchResource', () => {
  let server
  before(async () => {
    server = await testServer({
      cert: './test/fixtures/certificate.pem',
      key: './test/fixtures/key.pem',
      port: 12345,
    })
  })
  after(async () => {
    if (server) await server.close()
  })
  it('works with a self-signed certificate', async () => {
    const fetchResource = makeFetchResource({fetch, retries: 0, logger})
    const resource = await fetchResource({url: `https://localhost:${server.port}/smurfs.jpg`})
    expect(resource.hash.contentType).to.eql('image/jpeg')
  })
})
