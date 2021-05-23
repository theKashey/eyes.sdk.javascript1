'use strict'
const cwd = process.cwd()
const path = require('path')
const {setupEyes} = require('@applitools/test-utils')
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {MatchLevel} = require(cwd)
const {testSetup, getCheckSettings, validateVG2} = require('./EyesDifferentRunners')

describe('TestEyesDifferentRunners VG2', () => {
  let driver, destroyDriver, eyes
  const url = 'https://amazon.com'

  beforeEach(async function() {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    eyes = await setupEyes({vg: true})
    eyes.setSaveNewTests(false)
    await eyes.open(driver, 'Top Sites', `Top Sites - ${this.currentTest.title}`, {
      width: 800,
      height: 600,
    })
  })

  afterEach(async function() {
    await destroyDriver()
    await eyes.abortIfNotClosed()
  })

  it(`TestEyesDifferentRunners - ${url}`, () => {
    const testCase = testSetup(getCheckSettings, validateVG2)
    testCase(url, MatchLevel.Layout)
  })
})
