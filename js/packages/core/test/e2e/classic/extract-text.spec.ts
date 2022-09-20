import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'

describe('extract-text', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('works', async () => {
    const core = makeCore<spec.Driver, spec.Driver, spec.Element, spec.Selector>({spec})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core e2e',
        testName: 'extractText e2e test',
        environment: {viewportSize: {width: 700, height: 460}},
      },
    })
    await driver.get('https://applitools.github.io/demo/TestPages/OCRPage')
    const strings = await eyes.extractText({
      settings: [
        {region: 'body > h1'},
        {region: {type: 'css', selector: 'body > h1'}},
        {region: {type: 'css selector', selector: 'body > h1'}},
      ],
    })
    assert.deepStrictEqual(strings, ['Header 1: Hello world!', 'Header 1: Hello world!', 'Header 1: Hello world!'])
    const [result] = await eyes.close()
    assert.strictEqual(result.status, 'Passed')
  })
})
