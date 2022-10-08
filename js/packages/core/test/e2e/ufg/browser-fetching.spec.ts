import {makeCore} from '../../../src/ufg/core'
import {testServer} from '@applitools/test-server'
import * as spec from '@applitools/spec-driver-puppeteer'
import * as path from 'path'
import assert from 'assert'

describe('browser-fetching', () => {
  let page, destroyPage, server, baseUrl

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
    server = await testServer({
      middlewares: [{path: path.resolve('./test/fixtures/middlewares/ua-middleware')}],
      userAgent: 'CustomUserAgent',
    })
    baseUrl = `http://localhost:${server.port}`
  })

  after(async () => {
    await server.close()
    await destroyPage?.()
  })

  it('sends dontFetchResources to dom snapshot', async () => {
    await page.goto(`${baseUrl}/browser-fetching/index.html`)
    await page.setUserAgent('CustomUserAgent')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'VgFetch',
        testName: 'TestDisableBrowserFetching',
      },
    })
    await eyes.check({settings: {renderers: [{name: 'chrome', width: 800, height: 600}], disableBrowserFetching: true}})
    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})

    assert.strictEqual(result.status, 'Passed')
  })
})
