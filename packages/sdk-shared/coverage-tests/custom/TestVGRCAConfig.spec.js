'use strict'
const cwd = process.cwd()
const path = require('path')
const {setupEyes} = require('@applitools/test-utils')
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {Target} = require(cwd)

describe.skip('TestRenderings', () => {
  let driver, eyes, runner
  beforeEach(async () => {
    driver = await spec.build({browser: 'chrome'})
    await spec.visit(driver, 'https://applitools.com/helloworld')
    eyes = await setupEyes({vg: true})
    runner = eyes.getRunner()
  })
  it('Test_VG_RCA_Config', async () => {
    await spec.visit(driver, 'https://applitools.github.io/demo/TestPages/VisualGridTestPage')
    await eyes.open(driver, 'Test Visual Grid', 'Test RCA Config')
    eyes.setSendDom(true)
    await eyes.check('check', Target.window())
    await eyes.close()
    await runner.getAllTestResults()
  })

  it('Test_VG_RCA_Fluent', async () => {
    await spec.visit(driver, 'https://applitools.github.io/demo/TestPages/VisualGridTestPage')
    let frame = await spec.findElement(driver, 'iframe')
    await spec.switchToFrame(driver, frame)
    await spec.waitUntilDisplayed(driver, '#p2', 5 * 1000)
    await spec.switchToParentFrame(driver)
    eyes.setSendDom(false)
    await eyes.open(driver, 'Test Visual Grid', 'Test RCA Config')
    await eyes.check('check', Target.window())
    await eyes.close()
    await runner.getAllTestResults()
  })
  afterEach(async () => {
    await spec.cleanup(driver)
    await eyes.abortIfNotClosed()
  })
})
