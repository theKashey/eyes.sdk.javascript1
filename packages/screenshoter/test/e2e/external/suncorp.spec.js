const {makeDriver, sleep, test, logger} = require('../e2e')

/*
 * Manual steps:
 * 0. Turn on VPN
 * 1. In application config ensure to use proper api url (https://api-uat.test.suncorp.com.au/dev) and turn on helper lib
 * 2. Login to the application (103@x.y or 108@x.y)
 * 3. Ensure to use `noReset: true` in capabilities
 * 
 *         appActivity: 'au.com.suncorp.marketplace.presentation.startup.view.SplashActivity',
        appPackage: 'au.com.aami.marketplace.qa',
 */

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'android',
      app: '/Users/kyrylo/Downloads/Marketplace-1.14.0.2243-aami-qa-signed-aligned.apk',
      logger,
    })

    // ;[driver, destroyDriver] = await makeDriver({
    //   type: 'android-bs',
    //   deviceName: 'Samsung Galaxy S20 Plus',
    //   platformVersion: '10.0',
    //   app: 'bs://',
    //   logger,
    // })

    await driver.target.updateSettings({allowInvisibleElements: true})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot', async () => {
    await sleep(10000)

    const loginButton = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton.click()
    await sleep(3000)

    const passwordField = await driver.element({type: 'id', selector: 'passwordField'})
    await passwordField.type('a')
    const loginButton2 = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton2.click()
    await sleep(15000)

    await driver.init()

    await driver.mainContext.setScrollingElement({type: 'id', selector: 'insuranceTabNestedScrollView'})

    await test({
      type: 'android',
      tag: 'app-fully-suncorp',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it.skip('take full app screenshot', async () => {
    await sleep(10000)

    const loginButton = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton.click()
    await sleep(3000)

    const passwordField = await driver.element({type: 'id', selector: 'passwordField'})
    await passwordField.type('a')
    const loginButton2 = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton2.click()
    await sleep(15000)

    const profileButton = await driver.element({type: 'id', selector: 'profileFragment'})
    await profileButton.click()
    await sleep(10000)

    await driver.init()

    await driver.mainContext.setScrollingElement({type: 'class name', selector: 'android.widget.ScrollView'})

    await test({
      type: 'android',
      tag: 'app-fully-suncorp2',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it('take full app screenshot', async () => {
    await sleep(10000)

    const loginButton = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton.click()
    await sleep(3000)

    const passwordField = await driver.element({type: 'id', selector: 'passwordField'})
    await passwordField.type('a')
    const loginButton2 = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton2.click()
    await sleep(15000)

    const benefitsButton = await driver.element({type: 'id', selector: 'benefitsFragment'})
    await benefitsButton.click()
    await sleep(5000)

    await driver.init()

    await test({
      type: 'android',
      tag: 'app-fully-suncorp3',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it.only('take full app screenshot', async () => {
    await sleep(10000)

    const loginButton = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton.click()
    await sleep(3000)

    const passwordField = await driver.element({type: 'id', selector: 'passwordField'})
    await passwordField.type('a')
    const loginButton2 = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton2.click()
    await sleep(15000)

    const activeClaimsButton = await driver.element({type: 'id', selector: 'activeClaimsFragment'})
    await activeClaimsButton.click()
    await sleep(3000)

    await driver.init()

    await test({
      type: 'android',
      tag: 'app-fully-suncorp4',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it.skip('take full app screenshot', async () => {
    await sleep(10000)

    const loginButton = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton.click()
    await sleep(3000)

    // const emailField = await driver.element({type: 'id', selector: 'emailAddressField'})
    // await emailField.type('103@x.y')
    const passwordField = await driver.element({type: 'id', selector: 'passwordField'})
    await passwordField.type('a')
    const loginButton2 = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton2.click()
    await sleep(15000)

    const profileButton = await driver.element({type: 'id', selector: 'profileFragment'})
    await profileButton.click()
    await sleep(3000)

    const benefitsButton = await driver.element({type: 'id', selector: 'benefitsFragment'})
    await benefitsButton.click()
    await sleep(3000)

    const activeClaimsButton = await driver.element({type: 'id', selector: 'activeClaimsFragment'})
    await activeClaimsButton.click()
    await sleep(3000)

    const insuranceButton = await driver.element({type: 'id', selector: 'insuranceFragment'})
    await insuranceButton.click()
    await sleep(3000)

    await driver.init()

    await test({
      type: 'android',
      tag: 'app-fully-suncorp5',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
