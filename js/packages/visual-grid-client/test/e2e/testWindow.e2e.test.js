'use strict'

const {describe, it, before, after, beforeEach} = require('mocha')
const {expect} = require('chai')
const puppeteer = require('puppeteer')
const makeRenderingGridClient = require('../../src/sdk/renderingGridClient')
const {testServerInProcess} = require('@applitools/test-server')
const {presult} = require('@applitools/functional-commons')
const {DiffsFoundError, deserializeDomSnapshotResult} = require('@applitools/eyes-sdk-core')
const {getProcessPageAndSerialize} = require('@applitools/dom-snapshot')
const testLogger = require('../util/testLogger')

describe('testWindow', () => {
  let baseUrl, closeServer, testWindow
  const apiKey = process.env.APPLITOOLS_API_KEY // TODO bad for tests. what to do
  let browser, page
  let processPage

  beforeEach(() => {
    testWindow = makeRenderingGridClient(
      Object.assign({
        showLogs: process.env.APPLITOOLS_SHOW_LOGS,
        apiKey,
        fetchResourceTimeout: 2000,
        logger: testLogger,
      }),
    ).testWindow
  })

  before(async () => {
    if (!apiKey) {
      throw new Error('APPLITOOLS_API_KEY env variable is not defined')
    }
    const server = await testServerInProcess({port: 3455}) // TODO fixed port avoids 'need-more-resources' for dom. Is this desired? should both paths be tested?
    baseUrl = `http://localhost:${server.port}`
    closeServer = server.close

    browser = await puppeteer.launch()
    page = await browser.newPage()

    await page.setCookie({name: 'auth', value: 'secret', url: baseUrl})

    const processPageAndSerializeScript = await getProcessPageAndSerialize()
    processPage = () =>
      page.evaluate(`(${processPageAndSerializeScript})()`).then(deserializeDomSnapshotResult)
  })

  after(async () => {
    await closeServer()
    await browser.close()
  })

  it('passes with correct screenshot', async () => {
    await page.goto(`${baseUrl}/test.html`)

    const {cdt, url, resourceContents, resourceUrls} = await processPage()

    const openParams = {
      appName: 'some app',
      testName: 'passes with correct screenshot',
      browser: [
        {width: 640, height: 480, name: 'chrome'},
        {width: 800, height: 600, name: 'firefox'},
        {deviceName: 'iPhone X'},
      ],
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
    }

    const checkParams = {
      snapshot: {resourceUrls, resourceContents, cdt},
      tag: 'first',
      url,
      scriptHooks: {
        beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
      },
    }

    const results = await testWindow({openParams, checkParams})
    expect(results.length).to.eq(3)
    expect(results.map(r => r.getStatus())).to.eql(['Passed', 'Passed', 'Passed'])
  })

  it('fails with incorrect screenshot', async () => {
    await page.goto(`${baseUrl}/test.html`)

    const {cdt, url, resourceContents, resourceUrls} = await processPage()

    const openParams = {
      appName: 'some app',
      testName: 'fails with incorrect screenshot',
      browser: [
        {width: 640, height: 480, name: 'chrome'},
        {width: 800, height: 600, name: 'firefox'},
        {deviceName: 'iPhone X'},
      ],
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
    }

    cdt.find(node => node.nodeValue === "hi, I'm red").nodeValue = 'WRONG TEXT'
    const checkParams = {
      snapshot: {resourceUrls, resourceContents, cdt},
      tag: 'first',
      url,
      scriptHooks: {
        beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
      },
    }

    const [err] = await presult(testWindow({openParams, checkParams}))

    expect(err.length).to.eq(3)
    err.map(r => expect(r).to.be.instanceOf(DiffsFoundError))
  })
  it('does not fails after single aborted', async () => {
    await page.goto(`${baseUrl}/test-with-media-query.html`)

    const {cdt, url, resourceContents, resourceUrls} = await processPage()

    const openParams = {
      appName: 'some app',
      testName: 'does not fails after single aborted',
      browser: [
        {width: 1280, height: 768, name: 'chrome'},
        {width: 640, height: 480, name: 'chrome'},
        {width: 1024, height: 640, name: 'firefox'},
        {width: 800, height: 600, name: 'firefox'},
        {deviceName: 'iPhone X'},
      ],
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
    }
    const checkParams = {
      snapshot: {resourceUrls, resourceContents, cdt},
      tag: 'first',
      target: 'selector',
      selector: '#size-dependent-div',
      url,
    }
    // take out the indexes of expected to fail browsers: width is less then 700 or mobile
    const expectedFailureInIndexs = openParams.browser
      .map((b, i) => ((b.width && b.width < 700) || b.deviceName ? i : undefined))
      .filter(x => x)
    const [err] = await presult(testWindow({openParams, checkParams}))

    // Confusing: the 'err' array contains both 'TestResult' (passed) and 'Error' (failed) results
    expect(err.length).to.eq(5)
    expectedFailureInIndexs.map(r => expect(err[r]).to.be.instanceOf(Error))
  })

  it('one wrong device configuration will not fail whole test', async () => {
    await page.goto(`${baseUrl}/test.html`)

    const {cdt, url, resourceContents, resourceUrls} = await processPage()

    const openParams = {
      appName: 'some app',
      testName: 'one wrong device configuration will not fail whole test',
      browser: [
        {width: 1280, height: 768, name: 'chrome'},
        {
          iosDeviceInfo: {
            deviceName: 'PIXEL',
            iosVersion: 'latest',
          },
        },
      ],
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
    }
    const checkParams = {
      snapshot: {resourceUrls, resourceContents, cdt},
      tag: 'first',
      url,
    }
    const [err] = await presult(testWindow({openParams, checkParams}))

    // Confusing: the 'err' array contains both 'TestResult' (passed) and 'Error' (failed) results
    expect(err.length).to.eq(2)
    expect(err[0]).not.to.be.instanceOf(Error)
    expect(err[1]).to.be.instanceOf(Error)
  })
})
