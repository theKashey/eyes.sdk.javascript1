import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-webdriverio'
import * as utils from '@applitools/utils'
import assert from 'assert'

async function switchToWebview(driver: any, attempt = 1) {
  await utils.general.sleep(500)
  const worlds = await spec.getWorlds(driver)
  if (!worlds[1]) {
    if (attempt > 5) throw new Error(`no webview found - just ${worlds}`)
    return switchToWebview(driver, attempt++)
  }
  await spec.switchWorld(driver, worlds[1])
  return
}

describe('webview', () => {
  let driver, destroyDriver

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({
      device: 'iPhone 12',
      app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp/1.9/app/IOSTestApp.zip',
    })
  })

  afterEach(async () => {
    await destroyDriver?.()
  })

  describe('specified in check settings', () => {
    it('captures just the webview', async () => {
      await driver.$('xpath://XCUIElementTypeStaticText[@name="Web view"]').click()

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

      await eyes.check({
        settings: {webview: true}, // can alternatively specify a string of the webview id (if known) - e.g., {webview: 'webview-id'}
      })
      const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})

      assert.strictEqual(result.status, 'Passed')
    })

    it('captures just the webview (when manually switched to the webview)', async () => {
      await driver.$('xpath://XCUIElementTypeStaticText[@name="Web view"]').click()
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

      await eyes.check({
        settings: {webview: true},
      })
      const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})

      assert.strictEqual(result.status, 'Passed')
    })

    it('restores focus to the previous world after check', async () => {
      await driver.$('xpath://XCUIElementTypeStaticText[@name="Web view"]').click()

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
      await eyes.close({settings: {updateBaselineIfNew: false}}).catch()
      assert.deepStrictEqual(worldAfterCheck, worldBeforeCheck)
    })

    it('restores focus to the previous world after check (when manually switched to the webview)', async () => {
      await driver.$('xpath://XCUIElementTypeStaticText[@name="Web view"]').click()
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
      await eyes.close({settings: {updateBaselineIfNew: false}}).catch()
      assert.deepStrictEqual(worldAfterCheck, worldBeforeCheck)
    })
  })

  describe('not specified in check settings', () => {
    it('captures the viewport', async () => {
      await driver.$('xpath://XCUIElementTypeStaticText[@name="Web view"]').click()

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

      await eyes.check({})
      const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})

      assert.strictEqual(result.status, 'Passed')
    })

    it('captures the viewport (when manually switched to the webview)', async () => {
      await driver.$('xpath://XCUIElementTypeStaticText[@name="Web view"]').click()
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

      await eyes.check({})
      const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})

      assert.strictEqual(result.status, 'Passed')
    })

    it('restores focus to the previous world after check', async () => {
      await driver.$('xpath://XCUIElementTypeStaticText[@name="Web view"]').click()

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
      await eyes.close({settings: {updateBaselineIfNew: false}}).catch()
      assert.deepStrictEqual(worldAfterCheck, worldBeforeCheck)
    })

    it('restores focus to the previous world after check (when manually switched to the webview)', async () => {
      await driver.$('xpath://XCUIElementTypeStaticText[@name="Web view"]').click()
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
      await eyes.close({settings: {updateBaselineIfNew: false}}).catch()
      assert.deepStrictEqual(worldAfterCheck, worldBeforeCheck)
    })
  })

  it('has a helpful error when attempting to switch to a webview id that does not exist', async () => {
    await driver.$('xpath://XCUIElementTypeStaticText[@name="Web view"]').click()

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
