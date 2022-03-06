/* global fetch */
/* eslint-disable node/no-unsupported-features/node-builtins */
require('@applitools/isomorphic-fetch')
const {expect} = require('chai')
const assert = require('assert')
const nock = require('nock')
const makeFetchResource = require('../../../src/sdk/resources/fetchResource')
const createResource = require('../../../src/sdk/resources/createResource')
const logger = require('../../util/testLogger')

describe('fetchResource', () => {
  const mockResource = {
    url: 'http://something',
    type: 'some/content-type',
    value: Buffer.from('bla'),
  }
  const expectedResource = createResource(mockResource)

  const mockMediaResource = {
    url: 'http://something',
    type: 'audio/content-type',
    value: Buffer.from('bla'),
  }
  const expectedMediaResource = createResource(mockMediaResource)

  const urlResource = createResource({url: mockResource.url})

  it('fetches with content and content-type', async () => {
    nock(mockResource.url)
      .get('/')
      .reply(200, mockResource.value, {'content-type': mockResource.type})

    const fetchResource = makeFetchResource({fetch, retries: 0, logger})

    const resource = await fetchResource(urlResource)

    expect(resource).to.eql(expectedResource)
  })

  it('fetches with retries', async () => {
    let counter = 0
    nock(mockResource.url)
      .get('/')
      .reply(() => {
        counter += 1
        if (counter < 3) return null
        return [200, mockResource.value, {'content-type': mockResource.type}]
      })

    const fetchResource = makeFetchResource({logger, retries: 3, fetch})

    const resource = await fetchResource(urlResource)

    expect(resource).to.eql(expectedResource)
  })

  it('caches requests', async () => {
    nock(mockResource.url)
      .get('/')
      .once()
      .reply(200, mockResource.value, {'content-type': mockResource.type})

    const fetchResource = makeFetchResource({logger, retries: 0, fetch})

    const [resource1, resource2] = await Promise.all([
      fetchResource(urlResource),
      fetchResource(urlResource),
    ])

    expect(resource1).to.eql(expectedResource)
    expect(resource2).to.eql(expectedResource)
  })

  it('fetches with retries event though fails', async () => {
    let called = 0
    const dontFetch = () => ((called += 1), Promise.reject(new Error('DONT FETCH')))
    const fetchResourceWithRetry = makeFetchResource({fetch: dontFetch, retries: 3, logger})

    await assert.rejects(fetchResourceWithRetry(urlResource), new Error('DONT FETCH'))

    expect(called).to.equal(4)
  })

  it('stops retry and returns errosStatusCode when getting bad status', async () => {
    let called = 0
    const dontFetch = () => ((called += 1), Promise.resolve({ok: false, status: 404}))
    const fetchResourceWithRetry = makeFetchResource({fetch: dontFetch, retries: 3, logger})

    const resource = await fetchResourceWithRetry(urlResource)

    expect(resource).to.eql(createResource({url: urlResource.url, errorStatusCode: 404}))

    expect(called).to.equal(1)
  })

  describe('mediaDownloadTimeout', () => {
    it('stop fetching media after mediaDownloadTimeout', async () => {
      nock(mockMediaResource.url)
        .get('/')
        .delayBody(200)
        .reply(200, mockMediaResource.value, {'content-type': mockMediaResource.type})

      const fetchResource = makeFetchResource({fetch, mediaDownloadTimeout: 80, logger})

      const resource = await fetchResource(urlResource)

      expect(resource).to.eql(createResource({url: urlResource.url, errorStatusCode: 599}))
    })

    it("doesn't include headers fetching time", async () => {
      nock(mockMediaResource.url)
        .get('/')
        .delay(200)
        .reply(200, mockMediaResource.value, {'content-type': mockMediaResource.type})

      const fetchResource = makeFetchResource({fetch, mediaDownloadTimeout: 80, logger})

      const resource = await fetchResource(urlResource)

      expect(resource).to.eql(expectedMediaResource)
    })

    it("doesn't apply to requests with content length", async () => {
      nock(mockMediaResource.url)
        .get('/')
        .delayBody(200)
        .reply(200, mockMediaResource.value, {
          'content-type': mockMediaResource.type,
          'content-length': 3,
        })

      const fetchResource = makeFetchResource({fetch, mediaDownloadTimeout: 80, logger})

      const resource = await fetchResource(urlResource)

      expect(resource).to.eql(expectedMediaResource)
    })

    it("doesn't apply to requests with non media content type", async () => {
      nock(mockResource.url)
        .get('/')
        .delayBody(200)
        .reply(200, mockResource.value, {'content-type': mockResource.type})

      const fetchResource = makeFetchResource({fetch, mediaDownloadTimeout: 80, logger})

      const resource = await fetchResource(urlResource)

      expect(resource).to.eql(expectedResource)
    })
  })
})
