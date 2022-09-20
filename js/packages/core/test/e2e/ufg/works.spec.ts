import {testServer} from '@applitools/test-server'
import {getTestInfo} from '@applitools/test-utils'
import {makeLogger} from '@applitools/logger'
import {makeDriver} from '@applitools/driver'
import {makeCore} from '../../../src/ufg/core'
import {takeDomSnapshot} from '../../../src/ufg/utils/take-dom-snapshot'
import * as spec from '@applitools/spec-driver-puppeteer'
import assert from 'assert'

describe('works', () => {
  let page, destroyPage, server, baseUrl

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
    server = await testServer()
    baseUrl = `http://localhost:${server.port}`
  })

  after(async () => {
    await server.close()
    await destroyPage?.()
  })

  it('passes with correct page', async () => {
    await page.goto(`${baseUrl}/page/index.html`)

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'some app',
        testName: 'passes with correct screenshot',
      },
    })

    await eyes.check({
      settings: {
        name: 'first',
        fully: true,
        renderers: [
          {width: 640, height: 480, name: 'chrome'},
          {width: 800, height: 600, name: 'firefox'},
          {chromeEmulationInfo: {deviceName: 'iPhone X'}},
        ],
        hooks: {
          beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
        },
        ignoreRegions: [{region: 'div[class*="bg-"]'}],
        floatingRegions: [{region: 'img[src*="smurfs.jpg"]', offset: {top: 3}}],
      },
    })

    const results = await eyes.close()

    assert.strictEqual(results.length, 3)
    results.forEach(result => assert.strictEqual(result.status, 'Passed'))

    const expectedIgnoreRegions = [
      [
        {left: 8, top: 412, width: 151, height: 227, regionId: 'div[class*="bg-"] (1)'},
        {left: 8, top: 667, width: 151, height: 227, regionId: 'div[class*="bg-"] (2)'},
        {left: 8, top: 922, width: 151, height: 227, regionId: 'div[class*="bg-"] (3)'},
      ],
      [
        {left: 8, top: 418, width: 151, height: 227, regionId: 'div[class*="bg-"] (1)'},
        {left: 8, top: 674, width: 151, height: 227, regionId: 'div[class*="bg-"] (2)'},
        {left: 8, top: 930, width: 151, height: 227, regionId: 'div[class*="bg-"] (3)'},
      ],
      [
        {left: 8, top: 471, width: 151, height: 227, regionId: 'div[class*="bg-"] (1)'},
        {left: 8, top: 726, width: 151, height: 227, regionId: 'div[class*="bg-"] (2)'},
        {left: 8, top: 981, width: 151, height: 227, regionId: 'div[class*="bg-"] (3)'},
      ],
    ]

    const expectedFloatingRegions = [
      [
        {
          left: 8,
          top: 163,
          width: 151,
          height: 227,
          maxLeftOffset: 0,
          maxRightOffset: 0,
          maxUpOffset: 3,
          maxDownOffset: 0,
          regionId: 'img[src*="smurfs.jpg"]',
        },
      ],
      [
        {
          left: 8,
          top: 168,
          width: 151,
          height: 227,
          maxLeftOffset: 0,
          maxRightOffset: 0,
          maxUpOffset: 3,
          maxDownOffset: 0,
          regionId: 'img[src*="smurfs.jpg"]',
        },
      ],
      [
        {
          left: 8,
          top: 221,
          width: 151,
          height: 227,
          maxLeftOffset: 0,
          maxRightOffset: 0,
          maxUpOffset: 3,
          maxDownOffset: 0,
          regionId: 'img[src*="smurfs.jpg"]',
        },
      ],
    ]

    for (const [index, result] of results.entries()) {
      const testData = await getTestInfo(result, process.env.APPLITOOLS_API_KEY)
      assert.deepStrictEqual(testData.actualAppOutput[0].imageMatchSettings.ignore, expectedIgnoreRegions[index])
      assert.deepStrictEqual(testData.actualAppOutput[0].imageMatchSettings.floating, expectedFloatingRegions[index])
    }
  })

  it('fails with incorrect page', async () => {
    await page.goto(`${baseUrl}/page/index.html`)

    const [element] = await page.$x('//*[text()="hi, I\'m red"]')
    element.evaluate(element => (element.textContent = 'WRONG TEXT!'))

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'some app',
        testName: 'passes with correct screenshot',
      },
    })

    await eyes.check({
      settings: {
        name: 'first',
        fully: true,
        renderers: [
          {width: 640, height: 480, name: 'chrome'},
          {width: 800, height: 600, name: 'firefox'},
          {chromeEmulationInfo: {deviceName: 'iPhone X'}},
        ],
        hooks: {
          beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
        },
        ignoreRegions: [{region: 'div[class*="bg-"]'}],
        floatingRegions: [{region: 'img[src*="smurfs.jpg"]', offset: {top: 3}}],
      },
    })

    const results = await eyes.close()

    assert.strictEqual(results.length, 3)
    results.forEach(result => assert.strictEqual(result.status, 'Unresolved'))
  })

  it('passes with correct snapshot', async () => {
    await page.goto(`${baseUrl}/page/index.html`)

    const driver = await makeDriver({driver: page, spec})
    const snapshot = await takeDomSnapshot({context: driver.mainContext, logger: makeLogger()})
    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'some app',
        testName: 'passes with correct screenshot',
      },
    })

    await eyes.check({
      target: snapshot,
      settings: {
        name: 'first',
        fully: true,
        renderers: [
          {width: 640, height: 480, name: 'chrome'},
          {width: 800, height: 600, name: 'firefox'},
          {chromeEmulationInfo: {deviceName: 'iPhone X'}},
        ],
        hooks: {
          beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
        },
        ignoreRegions: [{region: 'div[class*="bg-"]'}],
        floatingRegions: [{region: 'img[src*="smurfs.jpg"]', offset: {top: 3}}],
      },
    })

    const results = await eyes.close()

    assert.strictEqual(results.length, 3)
    results.forEach(result => assert.strictEqual(result.status, 'Passed'))
  })

  it('fails with incorrect snapshot', async () => {
    await page.goto(`${baseUrl}/page/index.html`)

    const [element] = await page.$x('//*[text()="hi, I\'m red"]')
    element.evaluate(element => (element.textContent = 'WRONG TEXT!'))

    const driver = await makeDriver({driver: page, spec})
    const snapshot = await takeDomSnapshot({context: driver.mainContext, logger: makeLogger()})
    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'some app',
        testName: 'passes with correct screenshot',
      },
    })

    await eyes.check({
      target: snapshot,
      settings: {
        name: 'first',
        fully: true,
        renderers: [
          {width: 640, height: 480, name: 'chrome'},
          {width: 800, height: 600, name: 'firefox'},
          {chromeEmulationInfo: {deviceName: 'iPhone X'}},
        ],
        hooks: {
          beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
        },
        ignoreRegions: [{region: 'div[class*="bg-"]'}],
        floatingRegions: [{region: 'img[src*="smurfs.jpg"]', offset: {top: 3}}],
      },
    })

    const results = await eyes.close()

    assert.strictEqual(results.length, 3)
    results.forEach(result => assert.strictEqual(result.status, 'Unresolved'))
  })
})
