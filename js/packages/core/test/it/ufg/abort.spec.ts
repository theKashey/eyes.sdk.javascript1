import {makeCore} from '../../../src/ufg/core'
import {makeFakeClient} from '../../utils/fake-ufg-client'
import {makeFakeCore} from '../../utils/fake-base-core'
import * as utils from '@applitools/utils'
import assert from 'assert'

describe('abort', () => {
  it('handles abort with no started tests', async () => {
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 5, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    let aborted = false
    fakeCore.on('abort', () => (aborted = true))

    const results = await eyes.abort()
    assert.strictEqual(aborted, false)
    assert.deepStrictEqual(results.length, 0)
  })

  it('handles abort before render started', async () => {
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 5, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await eyes.check({
      target: {cdt: []},
      settings: {renderers: [{width: 100, height: 100}]},
    })

    let rendering = false
    fakeClient.on('beforeRender', () => (rendering = true))
    let aborted = false
    fakeCore.on('afterAbort', () => (aborted = true))

    const results = await new Promise<any>(resolve => {
      fakeClient.on('afterBookRenderer', () => resolve(eyes.abort()))
    })

    assert.strictEqual(rendering, false)
    assert.strictEqual(aborted, true)
    assert.strictEqual(results.length, 1)
    assert.deepStrictEqual(
      results.map(result => result.isAborted),
      [true],
    )
  })

  it('handles abort during open base eyes', async () => {
    const fakeClient = makeFakeClient({
      hooks: {
        bookRenderer: () => utils.general.sleep(0),
      },
    })
    const fakeCore = makeFakeCore({
      hooks: {
        openEyes: () => utils.general.sleep(0),
      },
    })
    const core = makeCore({concurrency: 5, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await eyes.check({
      target: {cdt: []},
      settings: {renderers: [{width: 100, height: 100}]},
    })

    let opened = false
    fakeCore.on('afterOpenEyes', () => (opened = true))
    let checking = false
    fakeCore.on('afterCheck', () => (checking = true))
    let aborted = false
    fakeCore.on('afterAbort', () => (aborted = true))

    const results = await new Promise<any>(resolve => {
      fakeCore.on('beforeOpenEyes', () => resolve(eyes.abort()))
    })

    assert.strictEqual(opened, true)
    assert.strictEqual(checking, false)
    assert.strictEqual(aborted, true)
    assert.strictEqual(results.length, 1)
    assert.deepStrictEqual(
      results.map(result => result.isAborted),
      [true],
    )
  })

  it('handles abort during check base eyes', async () => {
    const fakeClient = makeFakeClient({
      hooks: {
        bookRenderer: () => utils.general.sleep(0),
      },
    })
    const fakeCore = makeFakeCore({
      hooks: {
        check: () => utils.general.sleep(0),
      },
    })
    const core = makeCore({concurrency: 5, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes.check({
      target: {cdt: []},
      settings: {renderers: [{width: 100, height: 100}]},
    })

    let checked = false
    fakeCore.on('afterCheck', () => (checked = true))
    let aborted = false
    fakeCore.on('afterAbort', () => (aborted = true))

    const results = await new Promise<any>(resolve => {
      fakeCore.on('beforeCheck', () => resolve(eyes.abort()))
    })

    assert.strictEqual(checked, true)
    assert.strictEqual(aborted, true)
    assert.strictEqual(results.length, 1)
    assert.deepStrictEqual(
      results.map(result => result.isAborted),
      [true],
    )
  })
})
