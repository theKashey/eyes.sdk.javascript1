import type * as types from '@applitools/types'
import {strict as assert} from 'assert'
import * as api from '../../src'

const makeSDK = require('../utils/fake-sdk')

describe('Runner', () => {
  let sdk: types.Core<any, any, any> & {history: Record<string, any>[]; settings: Record<string, any>}
  const driver = {isDriver: true}

  class Eyes extends api.Eyes {
    protected static get _spec() {
      return sdk
    }
  }
  class ClassicRunner extends api.ClassicRunner {}
  class VisualGridRunner extends api.VisualGridRunner {}

  beforeEach(() => {
    sdk = makeSDK()
  })

  it('should return empty test summary from "getAllTestResults" method if no eyes instances were attached', async () => {
    const runner = new ClassicRunner()
    const summary = await runner.getAllTestResults()
    assert.ok(summary instanceof api.TestResultsSummary)
    assert.equal(Array.from(summary).length, 0)
  })

  it('should return empty test summary from "getAllTestResults" method if only attached eyes instance is disabled', async () => {
    const runner = new VisualGridRunner()
    const eyes = new Eyes(runner, {isDisabled: true})
    await eyes.open(driver)
    await eyes.check()
    eyes.close(false)
    const summary = await runner.getAllTestResults()
    assert.ok(summary instanceof api.TestResultsSummary)
    assert.equal(Array.from(summary).length, 0)
  })
})
