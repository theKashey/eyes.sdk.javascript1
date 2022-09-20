import assert from 'assert'
import nock from 'nock'
import {Response, type Request} from 'node-fetch'
import {makeReqEyes} from '../../src/server/req-eyes'

describe('req-eyes', () => {
  const req = makeReqEyes({
    config: {
      serverUrl: 'https://eyesapi.applitools.com',
      apiKey: 'api-key',
      agentId: 'agent-id',
    },
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('sets all of the default options into request', async () => {
    await req('/request', {fetch: fakeFetch as any})

    function fakeFetch(request: Request) {
      assert.strictEqual(request.url, 'https://eyesapi.applitools.com/request?apiKey=api-key')
      assert.strictEqual(request.headers.get('x-applitools-eyes-client'), 'agent-id')
      assert.ok(request.headers.has('x-applitools-eyes-client-request-id'))
      assert.ok(request.agent)
      return new Response()
    }
  })

  it('retries requests', async () => {
    let index = 0
    nock('https://eyesapi.applitools.com')
      .post('/request')
      .query(true)
      .times(3)
      .reply((_url, body) => {
        index += 1
        return index < 3 ? [500, null] : [200, body]
      })

    const response = await req('/request', {method: 'POST', body: {data: true}})
    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {data: true})
  })

  it('handles long requests', async () => {
    const expectedRetryIntervals = [1000, 1500, 2000]
    let prevRequestTimestamp
    nock('https://eyesapi.applitools.com')
      .post('/long')
      .query({apiKey: 'api-key'})
      .matchHeader('eyes-expect', '202+location')
      .matchHeader('eyes-expect-version', '2')
      .matchHeader('eyes-date', () => true)
      .reply(() => {
        prevRequestTimestamp = Date.now()
        return [
          202,
          '',
          {
            'Retry-After': expectedRetryIntervals[0] / 1000,
            Location: 'https://eyesapi.applitools.com/poll?index=0',
          },
        ]
      })
    nock('https://eyesapi.applitools.com')
      .get('/poll')
      .query({apiKey: 'api-key', index: /\d+/})
      .times(3)
      .reply(url => {
        const index = Number(new URL(url, 'https://eyesapi.applitools.com').searchParams.get('index'))
        assert.ok(Date.now() - prevRequestTimestamp >= expectedRetryIntervals[index])
        prevRequestTimestamp = Date.now()
        if (index >= 2) {
          return [201, '', {Location: `https://eyesapi.applitools.com/result`}]
        }
        return [
          200,
          '',
          {
            'Retry-After': expectedRetryIntervals[index + 1] / 1000,
            Location: `https://eyesapi.applitools.com/poll?index=${index + 1}`,
          },
        ]
      })
    nock('https://eyesapi.applitools.com')
      .delete('/result')
      .query({apiKey: 'api-key'})
      .matchHeader('eyes-date', () => true)
      .reply(200, {hello: 'result'})

    const response = await req('/long', {method: 'POST', body: Buffer.alloc(0)})

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'result'})
  })

  it('starts over if long request result was blocked due to concurrency', async () => {
    const expectedRetryIntervals = [1000, 1500, 2000]
    let index = 0
    nock('https://eyesapi.applitools.com')
      .get('/long')
      .query(true)
      .times(2)
      .reply(() => {
        return [202, '', {'Retry-After': 0, Location: `https://eyesapi.applitools.com/poll?index=${index > 0 ? 3 : 0}`}]
      })
    nock('https://eyesapi.applitools.com')
      .get('/poll')
      .query(true)
      .times(4)
      .reply(url => {
        const index = Number(new URL(url, 'https://eyesapi.applitools.com').searchParams.get('index'))
        if (index >= 2) {
          return [201, '', {Location: `https://eyesapi.applitools.com/result`}]
        }
        return [
          200,
          '',
          {
            'Retry-After': expectedRetryIntervals[index + 1] / 1000,
            Location: `https://eyesapi.applitools.com/poll?index=${index + 1}`,
          },
        ]
      })
    nock('https://eyesapi.applitools.com')
      .delete('/result')
      .query(true)
      .times(2)
      .reply(() => {
        return index++ > 0 ? [200, {hello: 'result'}] : [503, '']
      })

    const response = await req('/long')

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'result'})
  })
})
