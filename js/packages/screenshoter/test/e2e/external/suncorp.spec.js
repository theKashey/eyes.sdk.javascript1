const {makeDriver, sleep, test, logger} = require('../e2e')

/*
 * Manual steps:
 * 0. Turn on VPN
 * 1. In application config ensure to use proper api url (https://api-uat.test.suncorp.com.au/dev) and turn on helper lib
 * 2. Login to the application (103@x.y or 108@x.y)
 * 3. Ensure to use `noReset: true` in capabilities
 */

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'android',
      app: '/Users/kyrylo/Downloads/Marketplace-1.16.0.2781-aami-qa-signed-aligned.apk',
      noReset: true,
      appActivity: 'au.com.suncorp.marketplace.presentation.startup.view.SplashActivity',
      appPackage: 'au.com.aami.marketplace.qa',
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

  it('take full app screenshot on insurances screen', async () => {
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

  it('take full app screenshot on policy screen', async () => {
    await sleep(10000)

    const loginButton = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton.click()
    await sleep(3000)

    const passwordField = await driver.element({type: 'id', selector: 'passwordField'})
    await passwordField.type('a')
    const loginButton2 = await driver.element({type: 'id', selector: 'loginButton'})
    await loginButton2.click()
    await sleep(15000)

    const cardElement = await driver.element({type: 'id', selector: 'card_view'})
    await cardElement.click()
    await sleep(5000)

    await driver.init()

    await driver.mainContext.setScrollingElement({type: 'id', selector: 'policyDetailsScrollView'})

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

  it('take full app screenshot on profile screen', async () => {
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

  it('take full app screenshot on benefits screen', async () => {
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

  it('take full app screenshot on claims screen', async () => {
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
})

describe('screenshoter android ios', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'ios',
      app: '/Users/kyrylo/Downloads/aami-3.4.0-2582-fe8983426f-QA.ipa',
      udid: '00008101-001018180113001E',
      bundleId: 'au.com.suncorp.sg.aami',
      fullReset: false,
      noReset: true,
      logger,
    })

    await driver.target.updateSettings({allowInvisibleElements: true})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot', async () => {
    // await sleep(10000)

    // const loginButton = await driver.element({type: 'id', selector: 'loginButton'})
    // await loginButton.click()
    // await sleep(3000)

    // const passwordField = await driver.element({type: 'id', selector: 'passwordField'})
    // await passwordField.type('a')
    // const loginButton2 = await driver.element({type: 'id', selector: 'loginButton'})
    // await loginButton2.click()
    // await sleep(15000)

    // await driver.init()

    await driver.mainContext.setScrollingElement({
      type: '-ios predicate string',
      selector: "type = 'XCUIElementTypeCollectionView'",
    })

    await test({
      type: 'ios',
      tag: 'app-fully-suncorp',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
