import * as spec from '@applitools/spec-driver-selenium'
import {makeCore} from '../../src/index'
import assert from 'assert'

describe('close-manager', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('aborts unclosed tests when close manager', async () => {
    const core = makeCore({spec})
    const manager = await core.makeManager()
    const eyes = await manager.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core e2e',
        testName: 'aborts unclosed tests',
      },
    })

    await eyes.check({settings: {fully: false}})
    const summary = await manager.closeManager()
    assert.ok(summary.results)
    assert.ok(summary.results.length === 1)
    assert.ok(summary.results[0].result.isAborted)
  })

  it('should set add new test error to the summary', async () => {
    const core = makeCore({spec})
    const manager = await core.makeManager()

    await driver.get('https://applitools.com/helloworld')

    const eyes = await manager.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core e2e',
        testName: 'should set NewTestError to TestResultContainer Exception',
      },
    })

    await eyes.check({settings: {fully: false}})
    const summary = await manager.closeManager()
    assert.strictEqual((summary.results[0].error as any).reason, 'test new')
  })
})
