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
      settings: {appName: 'core e2e', testName: 'aborts unclosed tests'},
    })

    await eyes.check({settings: {fully: false}})
    const summary = await manager.closeManager()
    assert.ok(summary.results)
    assert.ok(summary.results.length === 1)
    assert.ok(summary.results[0].result.isAborted)
  })

  it('should add new test error to the summary', async () => {
    const core = makeCore({spec})
    const manager = await core.makeManager()

    await driver.get('https://applitools.com/helloworld')

    const eyes = await manager.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'should set NewTestError to TestResultContainer Exception'},
    })

    await eyes.check({settings: {fully: false}})
    const summary = await manager.closeManager()
    assert.strictEqual((summary.results[0].error as any).reason, 'test new')
  })

  it('should add internal error to the summary', async () => {
    const core = makeCore({spec})
    const manager = await core.makeManager({type: 'ufg', concurrency: 5})

    const eyes = await manager.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'should add internal error to the summary'},
    })

    await eyes.check({settings: {fully: false, renderers: [{name: 'firefox-3' as 'firefox', width: 640, height: 480}]}})
    const summary = await manager.closeManager()
    assert.strictEqual((summary.results[0].error as any).reason, 'internal')
  })
})
