import * as spec from '@applitools/spec-driver-selenium'
import * as assert from 'assert'
import {Eyes} from '../utils/client/webdriver'
import {VisualGridRunner} from '@applitools/eyes-api'

describe.skip('Universal client', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  describe('Web', () => {
    beforeEach(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
      await driver.get('https://applitools.github.io/demo/TestPages/FramesTestPage/index.html')
    })
    afterEach(async () => {
      await destroyDriver()
    })

    it('work with cli', async () => {
      const eyes = new Eyes(new VisualGridRunner({testConcurrency: 1}))
      const config = {
        appName: 'eyes-universal',
        testName: 'working with nodejs client',
        saveNewTests: false,
      }
      await eyes.open(driver, config)
      await eyes.check()
      const result = await eyes.close()
      assert.strictEqual(result.status, 'Passed')
    })
  })

  describe('Android', () => {
    beforeEach(async () => {
      ;[driver, destroyDriver] = await spec.build({
        device: 'Pixel 3 XL',
        app: 'https://applitools.jfrog.io/artifactory/Examples/runnerup_multiple_checks.apk',
      })
    })

    afterEach(async () => {
      await destroyDriver()
    })
    it('works', async () => {
      const config = {
        appName: 'universal e2e tests',
        testName: 'universal e2e test',
        saveNewTests: false,
        browsersInfo: [{androidDeviceInfo: {deviceName: 'Pixel 4 XL', androidVersion: 'latest'}}],
      }
      const eyes = new Eyes(new VisualGridRunner({testConcurrency: 1}))
      await eyes.open(driver, config)
      await eyes.check()
      const result = await eyes.close()
      assert.strictEqual(result.status, 'Passed')
    })
  })
})
