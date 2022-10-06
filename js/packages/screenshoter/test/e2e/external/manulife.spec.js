const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter ios app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      env: {
        capabilities: {
          browserName: '',
          pCloudy_Username: process.env.PCLOUDY_MANULIFE_USERNAME,
          pCloudy_ApiKey: process.env.PCLOUDY_MANULIFE_API_KEY,
          pCloudy_DurationInMinutes: 4,
          newCommandTimeout: 600,
          launchTimeout: 90000,
          pCloudy_DeviceFullName: 'APPLE_iPhone12_ios_15.2.0_fef61',
          platformVersion: '15.2.0',
          platformName: 'ios',
          acceptAlerts: true,
          automationName: 'XCUITest',
          bundleId: 'com.manulife.ap.sit.move',
          pCloudy_WildNet: 'false',
          pCloudy_EnableVideo: 'true',
          pCloudy_EnablePerformanceData: 'false',
          pCloudy_EnableDeviceLogs: 'true',
          appiumVersion: '1.20.2',
          noReset: true,
          fullReset: false,
        },
        url: 'https://manulife.pcloudy.com/appiumcloud/wd/hub',
      },
      logger,
    })

    await driver.target.updateSettings({allowInvisibleElements: true})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot on pager screen', async () => {
    await sleep(30000)

    await driver
      .element({type: 'xpath', selector: '//XCUIElementTypeTextField'})
      .then(field => field.type('hkss@mailinator.com'))
    await driver
      .element({type: 'xpath', selector: '//XCUIElementTypeSecureTextField'})
      .then(field => field.type('AutoPw@1'))
    await sleep(5000)
    await driver
      .element({type: 'xpath', selector: "//XCUIElementTypeButton[@name='Log in']"})
      .then(button => button.click())
    await sleep(10000)

    await driver.init()

    await test({
      type: 'ios',
      tag: 'app-fully-manulife',
      // fully: true,
      region: {type: 'xpath', selector: `//XCUIElementTypeStaticText[@name="Connect your Apple Watch"]/..`},
      framed: true,
      wait: 1500,
      overlap: {top: 0, bottom: 40},
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
