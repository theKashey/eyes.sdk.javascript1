/* global browser */
'use strict'
const {expect} = require('chai')
const {getTestInfo} = require('@applitools/test-utils')
const {version} = require('../../../package.json')

describe('vg', () => {
  it('full page', async () => {
    await browser.url('http://applitools.github.io/demo/TestPages/FramesTestPage/')
    await browser.eyesCheck('full page')
  })
  after(async () => {
    const testResults = await browser.eyesGetTestResults()
    const data = await getTestInfo(testResults, process.env.APPLITOOLS_API_KEY)
    expect(data.startInfo.agentId).to.equal(`eyes-webdriverio-service.visualgrid/${version}`)
  })
})
