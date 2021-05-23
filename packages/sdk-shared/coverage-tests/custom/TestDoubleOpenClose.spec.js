'use strict'
const path = require('path')
const assert = require('assert')
const cwd = process.cwd()
const {setupEyes} = require('@applitools/test-utils')
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {Target} = require(cwd)

const appName = 'Eyes Selenium SDK - Double Open Close'

describe.skip(appName, () => {
  let webDriver, destroyDriver, eyes

  afterEach(async () => {
    await eyes.abortIfNotClosed()
    await destroyDriver()
  })
  describe.skip('Classic', () => {
    let runner
    beforeEach(async () => {
      ;[webDriver, destroyDriver] = await spec.build({browser: 'chrome'})
      eyes = await setupEyes({stitchMode: 'CSS'})
      runner = eyes.getRunner()
    })

    it('TestDoubleOpenCheckClose', async () => {
      await spec.visit(webDriver, 'https://applitools.github.io/demo/TestPages/VisualGridTestPage/')
      await eyes.open(webDriver, appName, 'TestDoubleOpenCheckClose', {
        width: 1200,
        height: 800,
      })
      await eyes.check(
        'Step 1',
        Target.window()
          .fully()
          .ignoreDisplacements(false),
      )
      await eyes.close(false)

      await eyes.open(webDriver, appName, 'TestDoubleOpenCheckClose', {
        width: 1200,
        height: 800,
      })
      await eyes.check(
        'Step 2',
        Target.window()
          .fully()
          .ignoreDisplacements(false),
      )
      await eyes.close(false)

      let allTestResults = await runner.getAllTestResults(false)
      assert.deepStrictEqual(allTestResults.getAllResults().length, 2)
    })

    it('TestDoubleOpenCheckCloseAsync', async () => {
      await spec.visit(webDriver, 'https://applitools.github.io/demo/TestPages/VisualGridTestPage/')
      await eyes.open(webDriver, appName, 'TestDoubleOpenCheckCloseAsync', {
        width: 1200,
        height: 800,
      })
      await eyes.check(
        'Step 1',
        Target.window()
          .fully()
          .ignoreDisplacements(false),
      )
      await eyes.closeAsync(false)
      await eyes.open(webDriver, appName, 'TestDoubleOpenCheckCloseAsync', {
        width: 1200,
        height: 800,
      })
      await eyes.check(
        'Step 2',
        Target.window()
          .fully()
          .ignoreDisplacements(false),
      )
      await eyes.closeAsync(false)

      let allTestResults = await runner.getAllTestResults(false)
      assert.deepStrictEqual(allTestResults.getAllResults().length, 2)
    })
  })

  describe.skip('VG', () => {
    let runner
    beforeEach(async () => {
      ;[webDriver, destroyDriver] = await spec.build({browser: 'chrome'})
      eyes = await setupEyes({vg: true})
      runner = eyes.getRunner()
    })

    it.skip('TestDoubleOpenCheckClose', async () => {
      await spec.visit(webDriver, 'https://applitools.github.io/demo/TestPages/VisualGridTestPage/')
      await eyes.open(webDriver, appName, 'TestDoubleOpenCheckClose_VG', {
        width: 1200,
        height: 800,
      })
      await eyes.check(
        'Step 1',
        Target.window()
          .fully()
          .ignoreDisplacements(false),
      )
      await eyes.close(false)

      await eyes.open(webDriver, appName, 'TestDoubleOpenCheckClose_VG', {
        width: 1200,
        height: 800,
      })
      await eyes.check(
        'Step 2',
        Target.window()
          .fully()
          .ignoreDisplacements(false),
      )
      await eyes.close(false)

      let allTestResults = await runner.getAllTestResults(true)
      assert.deepStrictEqual(allTestResults.getAllResults().length, 2)
    })

    it('TestDoubleCheckDontGetAllResults', async () => {
      await spec.visit(webDriver, 'https://applitools.com/helloworld')
      await eyes.open(webDriver, appName, 'TestDoubleCheckDontGetAllResults_VG', {
        width: 1200,
        height: 800,
      })
      await eyes.check('Step 1', Target.window())
      await eyes.check('Step 2', Target.window())
      await eyes.close(false)
    })
  })
})
