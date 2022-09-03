import {takeScreenshot, takeSnapshot} from '../../src/client'
import assert from 'assert'
import selenium from 'selenium-webdriver'
import spec from '@applitools/spec-driver-selenium'

async function getBrokerURL(driver: any) {
  const element = await driver.findElement({
    xpath: '//XCUIElementTypeOther[@name="Applitools_View"]',
  })
  const result = JSON.parse(await element.getText())
  return result.nextPath
}

const env = {
  //android: {
  //  device: 'Pixel 3 XL duckduckgo',
  //  app: 'https://applitools.jfrog.io/artifactory/Examples/duckduckgo-5.87.0-play-debug.apk',
  //},
  ios: {
    device: 'iPhone 12',
    app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp-instrumented-nml-nmg-flat-caps.zip',
    injectUFGLib: true,
    withNML: true,
  },
}

// TODO: enable and verify when test apps received
describe('e2e client', () => {
  describe.skip('takeScreenshot', () => {
    for (const platform of Object.keys(env)) {
      it(`${platform} works`, async () => {
        const [driver, destroyDriver] = await spec.build({selenium, ...env[platform]})
        try {
          const brokerURL = await getBrokerURL(driver)
          const screenshotURL = await takeScreenshot(brokerURL)
          new URL(screenshotURL) // will throw if invalid
          //BONUS POINTS: perform a head request and check the content type and size
        } finally {
          await destroyDriver()
        }
      })
    }
  })
  describe('takeSnapshot', () => {
    for (const platform of Object.keys(env)) {
      it(`${platform} works`, async () => {
        const [driver, destroyDriver] = await spec.build({selenium, ...env[platform]})
        try {
          const brokerURL = await getBrokerURL(driver)
          const {resourceMap} = await takeSnapshot(brokerURL)
          assert.deepStrictEqual(resourceMap.metadata.platformName, platform)
          //BONUS POINTS: assert resourceMap.vhs.contentType, hash, and hashFormat have the relevant bits
        } finally {
          await destroyDriver()
        }
      })
    }
  })
})
