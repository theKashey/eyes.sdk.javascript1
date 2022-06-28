/* global browser */
'use strict'
const {expect} = require('chai')
const {Target} = require('../../../dist')
const {getTestInfo} = require('@applitools/test-utils')
const {version} = require('../../../package.json')

describe('EyesServiceTest', () => {
  it('checkWindow', async () => {
    await browser.url('https://applitools.github.io/demo/TestPages/FramesTestPage/index.html')
    await browser.eyesCheck('', Target.window())
    const testResults = await browser.eyesGetTestResults()
    const data = await getTestInfo(testResults, process.env.APPLITOOLS_API_KEY)
    expect(data.startInfo.agentId).to.equal(`eyes-webdriverio-service/${version}`)
  })
})
