import {makeCore} from '../../../src/ufg/core'
import {makeFakeClient} from '../../utils/fake-ufg-client'
import {makeFakeCore} from '../../utils/fake-base-core'
import {MockDriver, spec} from '@applitools/driver/fake'
import * as utils from '@applitools/utils'
import assert from 'assert'

describe('check', () => {
  it('renders multiple viewport sizes', async () => {
    const core = makeCore({core: makeFakeCore(), client: makeFakeClient(), concurrency: 10})

    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes.check({
      target: {cdt: []},
      settings: {
        name: 'good',
        renderers: [
          {width: 320, height: 480},
          {width: 640, height: 768},
          {width: 1600, height: 900},
        ],
      },
    })

    const results = await eyes.close()

    assert.deepStrictEqual(
      results.map(result => result.stepsInfo.map((step: any) => step.asExpected)),
      [[true], [true], [true]],
    )
  })

  it('renders with correct renderer', async () => {
    const core = makeCore({core: makeFakeCore(), client: makeFakeClient(), concurrency: 10})

    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes.check({
      target: {cdt: []},
      settings: {
        name: 'good',
        region: {x: 3, y: 4, width: 1, height: 2},
        renderers: [{name: 'firefox', width: 100, height: 100}],
      },
    })

    const results = await eyes.close()

    assert.deepStrictEqual(
      results.map(result => result.renderer),
      [{name: 'firefox', width: 100, height: 100}],
    )
  })

  it('runs base check in the correct order', async () => {
    const core = makeCore({core: makeFakeCore(), client: makeFakeClient(), concurrency: 10})

    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    const target = {
      cdt: [],
      hooks: {
        check({settings}) {
          if (settings.name === 'one') return utils.general.sleep(200)
          else if (settings.name === 'two') return utils.general.sleep(100)
          else return utils.general.sleep(0)
        },
      },
    }

    await eyes.check({
      target,
      settings: {
        name: 'one',
        renderers: [
          {name: 'chrome', width: 320, height: 480},
          {name: 'firefox', width: 640, height: 768},
        ],
      },
    })
    await eyes.check({
      target,
      settings: {
        name: 'two',
        renderers: [
          {name: 'chrome', width: 320, height: 480},
          {name: 'firefox', width: 640, height: 768},
        ],
      },
    })
    await eyes.check({
      target,
      settings: {
        name: 'three',
        renderers: [
          {name: 'chrome', width: 320, height: 480},
          {name: 'firefox', width: 640, height: 768},
        ],
      },
    })

    const results = await eyes.close()
    assert.deepStrictEqual(
      results.map((result: any) => result.stepsInfo.map((step: any) => `${step.settings.name}-${result.renderer.name}`)),
      [
        ['one-chrome', 'two-chrome', 'three-chrome'],
        ['one-firefox', 'two-firefox', 'three-firefox'],
      ],
    )
  })

  it('handles region by selector', async () => {
    const core = makeCore({core: makeFakeCore(), client: makeFakeClient(), concurrency: 10})

    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes.check({
      target: {cdt: []},
      settings: {name: 'good', region: 'sel1', renderers: [{width: 100, height: 100}]},
    })

    const results = await eyes.close()

    assert.deepStrictEqual(
      results.map(result =>
        result.stepsInfo.map((step: any) => ({asExpected: step.asExpected, locationInViewport: step.target.locationInViewport})),
      ),
      [[{asExpected: true, locationInViewport: {x: 1, y: 2}}]],
    )
  })

  it('handles region by coordinates', async () => {
    const core = makeCore({core: makeFakeCore(), client: makeFakeClient(), concurrency: 10})

    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes.check({
      target: {cdt: []},
      settings: {name: 'good', region: {x: 3, y: 4, width: 1, height: 2}, renderers: [{width: 100, height: 100}]},
    })

    const results = await eyes.close()

    assert.deepStrictEqual(
      results.map(result =>
        result.stepsInfo.map((step: any) => ({asExpected: step.asExpected, locationInViewport: step.target.locationInViewport})),
      ),
      [[{asExpected: true, locationInViewport: {x: 3, y: 4}}]],
    )
  })

  it('handles rendering error in one of the renderers', async () => {
    const fakeClient = makeFakeClient({
      hooks: {
        render: async ({request}) => {
          if (request.settings.renderer.name === 'chrome' && request.target.id === '1') {
            await utils.general.sleep(100)
            throw new Error('chrome render failed')
          }
        },
      },
    })
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 2, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes.check({
      target: {id: '1', cdt: []},
      settings: {
        renderers: [
          {name: 'chrome', width: 100, height: 100},
          {name: 'firefox', width: 100, height: 100},
        ],
      },
    })
    await eyes.check({
      target: {id: '2', cdt: []},
      settings: {
        renderers: [
          {name: 'chrome', width: 100, height: 100},
          {name: 'firefox', width: 100, height: 100},
        ],
      },
    })

    let checked = 0
    fakeCore.on('afterCheck', () => {
      checked += 1
    })

    await assert.rejects(eyes.close(), error => {
      return error.message === 'chrome render failed' && Boolean(error.info)
    })

    assert.strictEqual(checked, 2)
  })

  it('throws an error when dom snapshot returns an error', async () => {
    const driver = new MockDriver()
    driver.mockScript('dom-snapshot', () => JSON.stringify({status: 'ERROR', error: 'bla'}))
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 2, spec, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      target: driver,
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    assert.rejects(eyes.check({}), error => {
      return error.message === "Error during execute poll script: 'bla'"
    })
  })

  it('should throw an error on invalid dom snapshot JSON', async () => {
    const driver = new MockDriver()
    const response = Array.from({length: 200}, (_x, i) => i).join('')
    driver.mockScript('dom-snapshot', () => response)
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 2, spec, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      target: driver,
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    assert.rejects(eyes.check({}), error => {
      return (
        error.message ===
        `Response is not a valid JSON string. length: ${response.length}, first 100 chars: "${response.substr(
          0,
          100,
        )}", last 100 chars: "${response.substr(-100)}". error: SyntaxError: Unexpected number in JSON at position 1`
      )
    })
  })
})
