const assert = require('assert')
const makeSDK = require('../utils/fake-sdk')
const api = require('../../dist')

describe('Eyes', () => {
  class Eyes extends api.Eyes {}
  class ClassicRunner extends api.ClassicRunner {}
  class VisualGridRunner extends api.VisualGridRunner {}
  const driver = {isDriver: true}
  let sdk

  beforeEach(() => {
    sdk = makeSDK()
    Eyes._spec = sdk
  })

  it('should return empty test summary from "getAllTestResults" method if no eyes instances were attached', async () => {
    const runner = new ClassicRunner()
    const summary = await runner.getAllTestResults()
    assert.ok(summary instanceof api.TestResultsSummary)
    assert.strictEqual(Array.from(summary).length, 0)
  })

  it('should return empty test summary from "getAllTestResults" method if only attached eyes instance is disabled', async () => {
    const runner = new VisualGridRunner()
    const eyes = new Eyes(runner, {isDisabled: true})
    await eyes.open(driver)
    await eyes.check()
    eyes.close(false)
    const summary = await runner.getAllTestResults()
    assert.ok(summary instanceof api.TestResultsSummary)
    assert.strictEqual(Array.from(summary).length, 0)
  })
})
