import {makeCore} from '../../../src/ufg/core'
import * as spec from '@applitools/spec-driver-puppeteer'
import assert from 'assert'

describe('lazy load', () => {
  let page, destroyPage

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyPage?.()
  })

  it('performs lazy load before taking snapshot', async () => {
    await page.goto('https://applitools.github.io/demo/TestPages/LazyLoad/')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core app',
        testName: 'lazyLoad with layoutbreakpoints - checkSettings',
        environment: {viewportSize: {width: 800, height: 600}},
      },
    })

    await eyes.check({
      settings: {
        fully: true,
        lazyLoad: true,
        layoutBreakpoints: true,
        renderers: [{name: 'chrome', width: 1000, height: 600}],
      },
    })
    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})

    assert.strictEqual(result.status, 'Passed')
  })
})
