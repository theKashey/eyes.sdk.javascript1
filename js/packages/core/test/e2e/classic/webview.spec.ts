import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-webdriverio'
import * as utils from '@applitools/utils'
import assert from 'assert'

async function switchToWebview(driver: any, attempt = 1) {
  await utils.general.sleep(500)
  const worlds = await spec.getWorlds(driver)
  if (!worlds[1]) {
    if (attempt > 5) throw new Error(`no webview found - just ${worlds}`)
    return switchToWebview(driver, attempt + 1)
  }
  await spec.switchWorld(driver, worlds[1])
  return
}

describe('webview', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({
      device: 'iPhone 12',
      app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp/1.9/app/IOSTestApp.zip',
    })
    await driver.$('xpath://XCUIElementTypeStaticText[@name="Web view"]').click()
  })

  after(async () => {
    await destroyDriver?.()
  })

  afterEach(async () => {
    await spec.switchWorld(driver, 'NATIVE_APP')
  })

  describe('specified in check settings', () => {
    it('captures just the webview', async () => {
      const core = makeCore({spec})

      const eyes = await core.openEyes({
        target: driver,
        settings: {
          serverUrl: 'https://eyesapi.applitools.com',
          apiKey: process.env.APPLITOOLS_API_KEY,
          appName: 'core app',
          testName: 'webview',
        },
      })

      const worldBeforeCheck = await spec.getCurrentWorld(driver)
      await eyes.check({
        settings: {webview: true}, // can alternatively specify a string of the webview id (if known) - e.g., {webview: 'webview-id'}
      })
      const worldAfterCheck = await spec.getCurrentWorld(driver)
      assert.deepStrictEqual(worldAfterCheck, worldBeforeCheck)

      const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
      assert.strictEqual(result.status, 'Passed')
    })

    it('captures just the webview (when manually switched to the webview)', async () => {
      await switchToWebview(driver)

      const core = makeCore({spec})

      const eyes = await core.openEyes({
        target: driver,
        settings: {
          serverUrl: 'https://eyesapi.applitools.com',
          apiKey: process.env.APPLITOOLS_API_KEY,
          appName: 'core app',
          testName: 'webview',
        },
      })

      const worldBeforeCheck = await spec.getCurrentWorld(driver)
      await eyes.check({
        settings: {webview: true},
      })
      const worldAfterCheck = await spec.getCurrentWorld(driver)
      assert.deepStrictEqual(worldAfterCheck, worldBeforeCheck)

      const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
      assert.strictEqual(result.status, 'Passed')
    })
  })

  it('captures the viewport (when manually switched to the webview)', async () => {
    await switchToWebview(driver)

    const core = makeCore({spec})

    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core app',
        testName: 'webview - viewport',
      },
    })

    const worldBeforeCheck = await spec.getCurrentWorld(driver)
    await eyes.check({})
    const worldAfterCheck = await spec.getCurrentWorld(driver)
    assert.deepStrictEqual(worldAfterCheck, worldBeforeCheck)

    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    assert.strictEqual(result.status, 'Passed')
  })

  it('has a helpful error when attempting to switch to a webview id that does not exist', async () => {
    const core = makeCore({spec})

    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core app',
        testName: 'webview',
      },
    })
    assert.rejects(
      async () => {
        await eyes.check({settings: {webview: 'invalid-webview-id'}})
      },
      err => err.message.startsWith('Unable to switch worlds'),
    )
    await eyes.abort()
  })
})
