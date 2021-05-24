const assert = require('assert')
const makeSDK = require('../utils/fake-sdk')
const api = require('../../dist')

describe('Eyes', () => {
  class Eyes extends api.Eyes {}
  const driver = {isDriver: true}
  let sdk

  beforeEach(() => {
    sdk = makeSDK()
    Eyes._spec = sdk
  })

  it('should create classic eyes by default', async () => {
    const eyes = new Eyes()
    assert.ok(eyes.runner instanceof api.ClassicRunner)
    eyes.open(driver)
    assert.deepStrictEqual(
      sdk.history.filter(h => h.command === 'makeManager'),
      [{command: 'makeManager', data: {type: 'classic'}}],
    )
  })

  it('should create vg eyes with concurrency', async () => {
    const eyes = new Eyes(new api.VisualGridRunner({testConcurrency: 7}))
    assert.ok(eyes.runner instanceof api.VisualGridRunner)
    eyes.open(driver)
    assert.deepStrictEqual(
      sdk.history.filter(h => h.command === 'makeManager'),
      [{command: 'makeManager', data: {type: 'vg', concurrency: 7, legacy: false}}],
    )
  })

  it('should create vg eyes with legacy concurrency', async () => {
    const eyes = new Eyes(new api.VisualGridRunner(7))
    assert.ok(eyes.runner instanceof api.VisualGridRunner)
    eyes.open(driver)
    assert.deepStrictEqual(
      sdk.history.filter(h => h.command === 'makeManager'),
      [{command: 'makeManager', data: {type: 'vg', concurrency: 7, legacy: true}}],
    )
  })

  it('should merge configuration from eyes instance and "open" method', async () => {
    const config = {
      appName: 'base-app',
      displayName: 'name',
      branchName: 'branch',
      baselineBranchName: 'baseline',
    }
    const eyes = new Eyes()
    eyes.getConfiguration().setDisplayName(config.displayName)
    eyes.setBranchName(config.branchName)
    eyes.configuration.baselineBranchName = config.baselineBranchName

    const openConfig = {
      appName: 'app',
      testName: 'test',
      batch: {id: 'batch-id'},
    }
    eyes.open(driver, openConfig)
    assert.deepStrictEqual(
      sdk.history.filter(h => h.command === 'makeEyes'),
      [{command: 'makeEyes', data: {driver, config: {...config, ...openConfig}}}],
    )
  })

  it('should override configuration from eyes instance using "open" method arguments', async () => {
    const config = {
      appName: 'app',
      testName: 'test',
      displayName: 'name',
      viewportSize: {width: 600, height: 700},
      sessionType: 'SEQUENTIAL',
    }
    const eyes = new Eyes(config)

    const openConfig = {
      appName: 'app-o',
      testName: 'test-o',
      viewportSize: {width: 300, height: 400},
      sessionType: 'PROGRESSION',
    }
    eyes.open(driver, openConfig.appName, openConfig.testName, openConfig.viewportSize, openConfig.sessionType)
    assert.deepStrictEqual(
      sdk.history.filter(h => h.command === 'makeEyes'),
      [{command: 'makeEyes', data: {driver, config: {...config, ...openConfig}}}],
    )
  })

  it('should return driver from "open" method if eyes instance is disabled', async () => {
    const eyes = new Eyes()
    eyes.setIsDisabled(true)
    assert.deepStrictEqual(eyes.driver, undefined)
    const actualDriver = await eyes.open(driver)
    assert.deepStrictEqual(actualDriver, driver)
    assert.deepStrictEqual(eyes.driver, driver)
    assert.deepStrictEqual(eyes.getDriver(), driver)
    assert.ok(sdk.history.every(h => h.command !== 'open'))
  })

  it('should return driver from "open" method', async () => {
    const eyes = new Eyes()
    assert.deepStrictEqual(eyes.driver, undefined)
    const actualDriver = await eyes.open(driver)
    assert.deepStrictEqual(actualDriver, driver)
    assert.deepStrictEqual(eyes.driver, driver)
    assert.deepStrictEqual(eyes.getDriver(), driver)
  })

  it('should return null from "check" method if eyes instance is disabled', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    eyes.setIsDisabled(true)
    const actualResult = await eyes.check()
    assert.strictEqual(actualResult, null)
    assert.ok(sdk.history.every(h => h.command !== 'check'))
  })

  it('should throw from "check" method if it was called before "open" method', async () => {
    const eyes = new Eyes()
    await assert.rejects(eyes.check(), new api.EyesError('Eyes not open'))
  })

  it('should return match result "check" method', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    const actualResult = await eyes.check()
    assert.ok(actualResult instanceof api.MatchResult)
  })

  it('should return null from "close" method if eyes instance is disabled', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    await eyes.check()
    eyes.setIsDisabled(true)
    const actualResult = await eyes.close()
    assert.strictEqual(actualResult, null)
    assert.ok(sdk.history.every(h => h.command !== 'close'))
  })

  it('should return test results from "close" method', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    const actualResult = await eyes.close()
    assert.ok(actualResult instanceof api.TestResults)
  })

  it('should return test results from "close" method even without checks', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    await eyes.check()
    const actualResult = await eyes.close()
    assert.ok(actualResult instanceof api.TestResults)
  })

  it('should throw from "close" method if it was called before "open" method', async () => {
    const eyes = new Eyes()
    await assert.rejects(eyes.close(), new api.EyesError('Eyes not open'))
  })

  it('should throw from "close" method if test failed and "throw error" flag on', async () => {
    const eyes = new Eyes()
    await eyes.open(driver, {appName: 'app', testName: 'test'})
    await eyes.check({region: 'diff'})
    await assert.rejects(eyes.close(true), err => {
      return (
        err instanceof api.TestFailedError &&
        err.message === `Test 'test' of 'app' detected differences! See details at: https://eyes.applitools.com`
      )
    })
  })

  it('should not throw from "close" method if test failed and "throw error" flag off', async () => {
    const eyes = new Eyes()
    await eyes.open(driver, {appName: 'app', testName: 'test'})
    await eyes.check({region: 'diff'})
    const actualResult = await eyes.close(false)
    assert.strictEqual(actualResult.status, 'Unresolved')
  })

  it('should return null from "abort" method if eyes instance is disabled', async () => {
    const eyes = new Eyes()
    eyes.setIsDisabled(true)
    await eyes.open(driver, {appName: 'app', testName: 'test'})
    await eyes.check({region: 'diff'})
    const actualResult = await eyes.abort()
    assert.strictEqual(actualResult, null)
  })

  it('should return null from "abort" method if it was called before "open" method', async () => {
    const eyes = new Eyes()
    const actualResult = await eyes.abort()
    assert.strictEqual(actualResult, null)
  })

  it('should listen session events using "on" method', async () => {
    const viewportSize = {width: 200, height: 300}
    const eyes = new Eyes({viewportSize})
    const events = {}
    eyes.on('setSizeWillStart', data => (events.setSizeWillStart = data))
    eyes.on('setSizeEnded', () => (events.setSizeEnded = true))
    eyes.on('initStarted', () => (events.initStarted = true))
    eyes.on('initEnded', () => (events.initEnded = true))
    eyes.on('testStarted', data => (events.testStarted = data))
    eyes.on('validationWillStart', data => (events.validationWillStart = data))
    eyes.on('validationEnded', data => (events.validationEnded = data))
    eyes.on('testEnded', data => (events.testEnded = data))

    await eyes.open(driver)
    await eyes.check()
    const expectedTestResults = await eyes.close()

    assert.deepStrictEqual(events.setSizeWillStart, {viewportSize})
    assert.deepStrictEqual(events.setSizeEnded, true)
    assert.deepStrictEqual(events.initStarted, true)
    assert.deepStrictEqual(events.initEnded, true)
    assert.deepStrictEqual(events.testStarted, {sessionId: 'session-id'})
    assert.deepStrictEqual(events.validationWillStart, {
      sessionId: 'session-id',
      validationInfo: {validationId: 0, tag: ''},
    })
    assert.deepStrictEqual(events.validationEnded, {
      sessionId: 'session-id',
      validationId: 0,
      validationResult: {asExpected: true},
    })
    assert.deepStrictEqual(events.testEnded, {
      sessionId: 'session-id',
      testResults: expectedTestResults.toObject(),
    })
  })

  it('should listen session events using legacy session event handler', async () => {
    const viewportSize = {width: 200, height: 300}
    const eyes = new Eyes({viewportSize})
    const events = {}
    const handler = new api.SessionEventHandler()
    handler.setSizeWillStart = viewportSize => (events.setSizeWillStart = {viewportSize})
    handler.setSizeEnded = () => (events.setSizeEnded = true)
    handler.initStarted = () => (events.initStarted = true)
    handler.initEnded = () => (events.initEnded = true)
    handler.testStarted = sessionId => (events.testStarted = {sessionId})
    handler.validationWillStart = (sessionId, validationInfo) => {
      events.validationWillStart = {sessionId, validationInfo}
    }
    handler.validationEnded = (sessionId, validationId, validationResult) => {
      events.validationEnded = {sessionId, validationId, validationResult}
    }
    handler.testEnded = (sessionId, testResults) => {
      events.testEnded = {sessionId, testResults}
    }
    eyes.addSessionEventHandler(handler)

    await eyes.open(driver)
    await eyes.check()
    const expectedTestResults = await eyes.close()

    assert.deepStrictEqual(events.setSizeWillStart, {viewportSize: new api.RectangleSize(viewportSize)})
    assert.deepStrictEqual(events.setSizeEnded, true)
    assert.deepStrictEqual(events.initStarted, true)
    assert.deepStrictEqual(events.initEnded, true)
    assert.deepStrictEqual(events.testStarted, {sessionId: 'session-id'})
    assert.deepStrictEqual(events.validationWillStart, {
      sessionId: 'session-id',
      validationInfo: new api.ValidationInfo({validationId: 0, tag: ''}),
    })
    assert.deepStrictEqual(events.validationEnded, {
      sessionId: 'session-id',
      validationId: 0,
      validationResult: new api.ValidationResult({asExpected: true}),
    })
    assert.deepStrictEqual(events.testEnded, {
      sessionId: 'session-id',
      testResults: new api.TestResults(expectedTestResults.toObject()),
    })
  })

  it('should set viewport size with static method', async () => {
    const viewportSize = {width: 100, height: 101}
    await Eyes.setViewportSize(driver, viewportSize)
    const viewportSizeData = new api.RectangleSize(200, 201)
    await Eyes.setViewportSize(driver, viewportSizeData)

    assert.deepStrictEqual(
      sdk.history.filter(h => h.command === 'setViewportSize'),
      [
        {command: 'setViewportSize', data: [driver, viewportSize]},
        {command: 'setViewportSize', data: [driver, viewportSizeData]},
      ],
    )
  })

  it('should set viewport size with instance method in configuration before open', async () => {
    const eyes = new Eyes()
    const viewportSize = {width: 100, height: 101}
    await eyes.setViewportSize(viewportSize)
    assert.deepStrictEqual(eyes.configuration.viewportSize, viewportSize)
    const viewportSizeData = new api.RectangleSize(200, 201)
    await eyes.setViewportSize(viewportSizeData)
    assert.deepStrictEqual(eyes.configuration.viewportSize, viewportSizeData)
  })

  it('should set viewport size with instance method after open', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    const viewportSize = {width: 100, height: 101}
    await eyes.setViewportSize(viewportSize)
    assert.deepStrictEqual(eyes.configuration.viewportSize, viewportSize)
    const viewportSizeData = new api.RectangleSize(200, 201)
    await eyes.setViewportSize(viewportSizeData)
    assert.deepStrictEqual(eyes.configuration.viewportSize, viewportSizeData)

    assert.deepStrictEqual(
      sdk.history.filter(h => h.command === 'setViewportSize'),
      [
        {command: 'setViewportSize', data: [driver, viewportSize]},
        {command: 'setViewportSize', data: [driver, viewportSizeData]},
      ],
    )
  })

  it('should get viewport size even if it was not set after open', async () => {
    const eyes = new Eyes()

    const viewportSize = {width: 700, height: 500}
    sdk.settings.viewportSize = viewportSize

    await eyes.open(driver)
    const actualViewportSize = await eyes.getViewportSize()
    assert.deepStrictEqual(actualViewportSize.toObject(), viewportSize)

    assert.deepStrictEqual(
      sdk.history.filter(h => h.command === 'getViewportSize'),
      [{command: 'getViewportSize', data: [driver], result: viewportSize}],
    )
  })
})
