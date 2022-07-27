const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter ios app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'ios-bs',
      app: 'bs://33647e8de45b0bbfeae051ebd3c65ab891a5da02',
      logger,
    })

    await driver.target.updateSettings({allowInvisibleElements: true})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot on pager screen', async () => {
    await sleep(5000)
    await driver
      .element({type: '-ios predicate string', selector: "name == 'Singapore'"})
      .then(button => button.click())
    await driver.element({type: '-ios predicate string', selector: "name == 'Next'"}).then(button => button.click())
    await driver.element({type: '-ios predicate string', selector: "name == 'Skip'"}).then(button => button.click())
    await driver.target.acceptAlert()
    await driver.element({type: 'xpath', selector: '//*[@value="Enter your email address"]'})
    await driver
      .element({type: 'xpath', selector: '//XCUIElementTypeTextField'})
      .then(field => field.type('tuser@mailinator.com'))
    await driver
      .element({type: 'xpath', selector: '//XCUIElementTypeSecureTextField'})
      .then(field => field.type('AutoPw@1'))
    await sleep(5000)
    await driver.execute('mobile: tap', {x: 50, y: 430})
    await sleep(10000)
    await driver.target.acceptAlert()
    await driver.execute('mobile: tap', {x: 139, y: 755})
    await sleep(5000)
    await driver.execute('mobile: activateApp', {bundleId: 'com.manulife.ap.sit.move'})
    await sleep(5000)
    await driver.execute('mobile: tap', {x: 139, y: 755})
    await sleep(5000)
    await driver.execute('mobile: tap', {x: 22, y: 62})
    await sleep(5000)

    // await driver.element({type: 'xpath', selector: '//*[@label="Profile"]'}).then(button => button.click())
    // await driver.element({type: 'xpath', selector: '//*[@label="My Policies"]'}).then(button => button.click())

    await driver.init()

    await driver.mainContext.setScrollingElement({type: 'xpath', selector: '//XCUIElementTypeTable'})

    await test({
      type: 'ios',
      tag: 'app-fully-manulife',
      fully: true,
      framed: true,
      wait: 1500,
      overlap: {top: 0, bottom: 40},
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
