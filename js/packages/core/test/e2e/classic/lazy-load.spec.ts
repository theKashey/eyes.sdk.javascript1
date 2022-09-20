import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'

describe('lazy load', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('performs lazy load before taking screenshot', async () => {
    await driver.get('https://applitools.github.io/demo/TestPages/LazyLoad/')

    const core = makeCore({spec})

    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core app',
        testName: 'lazyLoad with classic - checkSettings',
        environment: {viewportSize: {width: 800, height: 600}},
      },
    })

    await eyes.check({
      settings: {fully: true, lazyLoad: true, hideScrollbars: true},
    })
    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})

    assert.strictEqual(result.status, 'Passed')
  })
})
