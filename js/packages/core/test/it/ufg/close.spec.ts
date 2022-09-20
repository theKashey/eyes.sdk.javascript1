import {makeCore} from '../../../src/ufg/core'
import {makeFakeClient} from '../../utils/fake-ufg-client'
import {makeFakeCore} from '../../utils/fake-base-core'
import assert from 'assert'

describe('close', async () => {
  it('handles close with no started tests', async () => {
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 5, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    let closed = false
    fakeCore.on('abort', () => (closed = true))

    const results = await eyes.close()
    assert.strictEqual(closed, false)
    assert.deepStrictEqual(results.length, 0)
  })

  it('returns multiple test results', async () => {
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 5, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await eyes.check({
      target: {cdt: []},
      settings: {
        renderers: [
          {name: 'chrome', width: 100, height: 100},
          {name: 'firefox', width: 100, height: 100},
        ],
      },
    })
    const results = await eyes.close()

    assert.deepStrictEqual(
      results.map(results => ({status: results.status, renderer: results.renderer})),
      [
        {status: 'Passed', renderer: {name: 'chrome', width: 100, height: 100}},
        {status: 'Passed', renderer: {name: 'firefox', width: 100, height: 100}},
      ],
    )
  })

  it('throws error if check failed', async () => {
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore({
      hooks: {
        check: () => {
          throw new Error('check failed')
        },
      },
    })
    const core = makeCore({concurrency: 5, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await eyes.check({
      target: {cdt: []},
      settings: {
        renderers: [
          {name: 'chrome', width: 100, height: 100},
          {name: 'firefox', width: 100, height: 100},
        ],
      },
    })

    await assert.rejects(eyes.close(), error => {
      return error.message === 'check failed' && Boolean(error.renderer && error.eyes)
    })
  })

  it('throws error if render failed', async () => {
    const fakeClient = makeFakeClient({
      hooks: {
        render: () => {
          throw new Error('render failed')
        },
      },
    })
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 5, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await eyes.check({
      target: {cdt: []},
      settings: {
        renderers: [
          {name: 'chrome', width: 100, height: 100},
          {name: 'firefox', width: 100, height: 100},
        ],
      },
    })

    await assert.rejects(eyes.close(), error => {
      return error.message === 'render failed' && Boolean(error.renderer && error.eyes)
    })
  })
})
