import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'

describe('default scroll root element', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('uses html or body as default scroll root elements', async () => {
    const core = makeCore<spec.Driver, spec.Driver, spec.Element, spec.Selector>({spec})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'scrollingElement',
        testName: 'test scrollingElement',
      },
    })
    await driver.get('https://applitools.github.io/demo/TestPages/ScrollingElement/body.html')
    await eyes.check({settings: {name: 'body scrolling element', fully: true, hideScrollbars: true}})
    await driver.get('https://applitools.github.io/demo/TestPages/ScrollingElement/html.html')
    await eyes.check({settings: {name: 'html scrolling element', fully: true, hideScrollbars: true}})
    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    assert.strictEqual(result.status, 'Passed')
  })
})
