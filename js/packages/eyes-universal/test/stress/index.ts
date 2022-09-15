import {Eyes} from '../utils/client/webdriver'
import {VisualGridRunner} from '@applitools/eyes-api'
import type {Driver} from '@applitools/spec-driver-selenium'
import * as spec from '@applitools/spec-driver-selenium'

async function runSingleTest() {
  const [driver, stopDriver]: [Driver, () => Promise<void>] = await spec.build({browser: 'chrome'})
  await driver.get('https://applitools.github.io/demo/TestPages/FramesTestPage/index.html')
  const eyes = new Eyes(new VisualGridRunner({testConcurrency: 1}))
  const config = {
    appName: 'Test nodejs client',
    testName: 'universal client stress test',
    saveNewTests: false,
  }
  await eyes.open(driver, config)
  await eyes.check()
  await eyes.close()
  await stopDriver()
}

;(async () => {
  await runSingleTest()
})()
