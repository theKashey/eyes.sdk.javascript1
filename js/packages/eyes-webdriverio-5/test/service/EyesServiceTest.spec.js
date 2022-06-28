/* eslint-disable no-undef */
'use strict'

const assert = require('assert')
const {By, Target} = require('../../dist')

describe.only('EyesServiceTest', () => {
  beforeEach(async () => {
    await browser.url('http://applitools.github.io/demo/TestPages/FramesTestPage/')
    await browser.eyesClearProperties()
  })

  it('an empty test without check', async () => {
    assert.strictEqual(await browser.eyesGetIsOpen(), false)
  })

  it('checkWindow', async () => {
    assert.strictEqual(await browser.eyesGetIsOpen(), false)
    await browser.eyesCheckWindow('main')
    assert.strictEqual(await browser.eyesGetIsOpen(), true)
  })

  it('checkWindow - no title', async () => {
    assert.strictEqual((await browser.eyesGetConfiguration()).getProperties().length, 0)
    await browser.eyesAddProperty('testProp', 'foobar')
    assert.strictEqual((await browser.eyesGetConfiguration()).getProperties().length, 1)

    await browser.eyesCheckWindow()
  })

  it('checkRegion and checkFrame', async () => {
    await browser.eyesCheck('region', Target.region(By.id('overflowing-div')))

    await browser.eyesCheck('frame', Target.frame('frame1'))
  })

  afterEach(async () => {
    /** @type {TestResults} */
    const testResults = await browser.eyesGetTestResults()
    if (testResults) {
      if (testResults.isPassed()) {
        console.log(`${testResults.getName()} is passed.`)
      } else {
        console.log(`Test is not passed: ${testResults.getMismatches()} out of ${testResults.getSteps()} failed.`)
        console.log(`Step details URL: ${testResults.getAppUrls().getSession()}`)
      }
    }
  })
})
