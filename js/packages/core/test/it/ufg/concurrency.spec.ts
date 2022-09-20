import {makeCore} from '../../../src/ufg/core'
import * as utils from '@applitools/utils'
import assert from 'assert'

describe('concurrency', () => {
  it('waits for base eyes to open before start rendering', async () => {
    const counters = {baseOpenEyes: 0, baseCheck: 0, bookRenderer: 0, render: 0}

    const fakeCore = {
      getAccountInfo() {
        return {}
      },
      async openEyes() {
        await utils.general.sleep(50)
        counters.baseOpenEyes++
        return {
          async check() {
            await utils.general.sleep(50)
            counters.baseCheck++
            return [{}]
          },
          async close() {
            await utils.general.sleep(0)
            return [{}]
          },
        }
      },
    }

    const fakeClient = {
      async createRenderTarget() {
        return {}
      },
      async bookRenderer() {
        await utils.general.sleep(50)
        counters.bookRenderer++
        return {rendererId: 'renderer-id'}
      },
      async render() {
        await utils.general.sleep(50)
        counters.render++
        return {
          renderId: 'render-id',
          status: 'rendered',
          image: 'image-url',
        }
      },
    }

    const core = makeCore({concurrency: 1, core: fakeCore as any, client: fakeClient as any})

    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    // t0 - nothing happened
    await utils.general.sleep(0)
    assert.deepStrictEqual(counters, {baseOpenEyes: 0, baseCheck: 0, bookRenderer: 0, render: 0})
    await eyes.check({
      target: {cdt: []},
      settings: {renderers: [{name: 'chrome', width: 100, height: 100}]},
    })
    //t1 - renderer booked
    await utils.general.sleep(55)
    assert.deepStrictEqual(counters, {baseOpenEyes: 0, baseCheck: 0, bookRenderer: 1, render: 0})
    //t2 - eyes opened
    await utils.general.sleep(55)
    assert.deepStrictEqual(counters, {baseOpenEyes: 1, baseCheck: 0, bookRenderer: 1, render: 0})
    //t3 - snapshot rendered
    await utils.general.sleep(55)
    assert.deepStrictEqual(counters, {baseOpenEyes: 1, baseCheck: 0, bookRenderer: 1, render: 1})
    //t4 - target checked
    await utils.general.sleep(55)
    assert.deepStrictEqual(counters, {baseOpenEyes: 1, baseCheck: 1, bookRenderer: 1, render: 1})

    await eyes.close()
  })

  it('prevents base eyes from open if concurrency slot is not available', async () => {
    const counters = {openEyes: {1: 0, 2: 0, 3: 0}}

    const fakeCore = {
      getAccountInfo() {
        return {}
      },
      async openEyes({settings}) {
        counters.openEyes[settings.testName] += 1
        return {
          async check() {
            return [{}]
          },
          async close() {
            return [{}]
          },
        }
      },
    }

    const fakeClient = {
      async createRenderTarget() {
        return {}
      },
      async bookRenderer() {
        return {rendererId: 'renderer-id'}
      },
      async render() {
        return {
          renderId: 'render-id',
          status: 'rendered',
          image: 'image-url',
        }
      },
    }

    const core = makeCore({concurrency: 2, core: fakeCore as any, client: fakeClient as any})

    const eyes = await Promise.all([
      core.openEyes({settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: '1'}}),
      core.openEyes({settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: '2'}}),
      core.openEyes({settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: '3'}}),
    ])

    // t1 - trying to open base eyes 3 times with concurrency 2
    await eyes[0].check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    await eyes[1].check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    await eyes[2].check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    assert.deepStrictEqual(counters, {openEyes: {1: 1, 2: 1, 3: 0}})

    // t2 - releasing concurrency slot by closing one of the previously opened eyes
    await eyes[1].close()
    assert.deepStrictEqual(counters, {openEyes: {1: 1, 2: 1, 3: 1}})

    await eyes[0].close()
    await eyes[2].close()
  })

  it('releases concurrency slot if eyes throw during close', async () => {
    const fakeCore = {
      getAccountInfo() {
        return {}
      },
      async openEyes() {
        return {
          async check() {
            return [{}]
          },
          async close() {
            throw new Error('close')
          },
        }
      },
    }

    const fakeClient = {
      async createRenderTarget() {
        return {}
      },
      async bookRenderer() {
        return {rendererId: 'renderer-id'}
      },
      async render() {
        return {
          renderId: 'render-id',
          status: 'rendered',
          image: 'image-url',
        }
      },
    }

    const core = makeCore({concurrency: 1, core: fakeCore as any, client: fakeClient as any})

    const eyes1 = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes1.check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})

    await assert.rejects(eyes1.close(), error => error.message === 'close')

    const eyes2 = await Promise.race([
      core.openEyes({settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'}}),
      utils.general.sleep(100).then(() => assert.fail('not resolved')),
    ])

    await eyes2.check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})

    await assert.rejects(eyes2.close(), error => error.message === 'close')
  })

  it('releases concurrency slot if ufg client throw during render', async () => {
    const fakeCore = {
      getAccountInfo() {
        return {}
      },
      async openEyes() {
        return {
          async check() {
            return [{}]
          },
          async close() {
            return [{}]
          },
          async abort() {
            return [{}]
          },
        }
      },
    }

    const fakeClient = {
      async createRenderTarget() {
        return {}
      },
      async bookRenderer() {
        return {rendererId: 'renderer-id'}
      },
      async render() {
        throw new Error('render')
      },
    }

    const core = makeCore({concurrency: 1, core: fakeCore as any, client: fakeClient as any})

    const eyes1 = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes1.check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})

    await assert.rejects(eyes1.close(), error => error.message === 'render')

    const eyes2 = await Promise.race([
      core.openEyes({settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'}}),
      utils.general.sleep(100).then(() => assert.fail('not resolved')),
    ])

    await eyes2.check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})

    await assert.rejects(eyes2.close(), error => error.message === 'render')
  })
})
