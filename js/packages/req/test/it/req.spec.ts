import assert from 'assert'
import nock from 'nock'
import {req} from '../../src/req'

describe('req', () => {
  it('works', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').reply(200, {hello: 'world'})
    const response = await req('https://eyesapi.applitools.com/api/hello')

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('merges url with base url', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').reply(200, {hello: 'world'})

    const response = await req('./hello', {baseUrl: 'https://eyesapi.applitools.com/api/'})

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('merges query params to url', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello?init=true&hello=world').reply(200, {hello: 'world'})

    const response = await req('https://eyesapi.applitools.com/api/hello?init=true', {query: {hello: 'world'}})

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('retries on configured error codes', async () => {
    let index = 0
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .reply(function () {
        if (index++ > 0) this.req.destroy()
        return [200, {hello: 'world'}]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: [{codes: ['ECONNRESET']}],
    })

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('retries on configured status codes', async () => {
    let index = 0
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .times(2)
      .reply(() => {
        return index++ > 0 ? [200, {hello: 'world'}] : [500]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: [{statuses: [500]}],
    })

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('retries on configured status codes with limit', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').times(3).reply(500, {hello: 'error'})

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: [{statuses: [500], limit: 2}],
    })

    assert.strictEqual(response.status, 500)
    assert.deepStrictEqual(await response.json(), {hello: 'error'})
  })

  it('retries on configured status codes with timeout', async () => {
    let prevRequestTimestamp
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .times(2)
      .reply(() => {
        if (prevRequestTimestamp) assert.ok(Date.now() - prevRequestTimestamp >= 1000)
        prevRequestTimestamp = Date.now()
        return [500, {hello: 'error'}]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: [{statuses: [500], limit: 1, timeout: 1000}],
    })

    assert.strictEqual(response.status, 500)
    assert.deepStrictEqual(await response.json(), {hello: 'error'})
  })

  it('retries on configured status codes with timeout backoff', async () => {
    const expectedRetryIntervals = [1000, 1500, 2000]
    let index = -1
    let prevRequestTimestamp
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .times(4)
      .reply(() => {
        // if retry
        if (index >= 0) {
          assert.ok(Date.now() - prevRequestTimestamp >= expectedRetryIntervals[index])
        }
        prevRequestTimestamp = Date.now()
        index += 1
        return [500, {hello: 'error'}]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: [{statuses: [500], limit: 3, timeout: expectedRetryIntervals}],
    })

    assert.strictEqual(response.status, 500)
    assert.deepStrictEqual(await response.json(), {hello: 'error'})
  })

  it('aborts request on timeout', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').delay(1100).reply(200, {hello: 'world'})

    await assert.rejects(
      () => req('https://eyesapi.applitools.com/api/hello', {timeout: 1000}),
      error => error.constructor.name === 'AbortError',
    )
  })

  it('executes hooks', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').matchHeader('before-request', 'true').reply(200, {hello: 'world'})
    const response = await req('https://eyesapi.applitools.com/api/hello', {
      hooks: {
        beforeRequest: ({request}) => request.headers.set('before-request', 'true'),
        afterResponse: ({response}) => response.headers.set('after-response', 'true'),
      },
    })

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
    assert.deepStrictEqual(await response.headers.get('after-response'), 'true')
  })
})
