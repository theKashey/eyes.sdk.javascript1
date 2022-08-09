const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'android',
      app: '/Users/kyrylo/Downloads/InstrumentedAppWithFlutterJuly26.apk',
      logger,
    })

    // ;[driver, destroyDriver] = await makeDriver({
    //   type: 'android-sauce',
    //   deviceName: 'Google Pixel 3 GoogleAPI Emulator',
    //   platformVersion: '11.0',
    //   app: 'storage:6f652ae7-53c2-450e-87ff-89b23d4dfe26',
    //   logger,
    // })

    // ;[driver, destroyDriver] = await makeDriver({
    //   type: 'android-bs',
    //   deviceName: 'Google Pixel 3',
    //   platformVersion: '10.0',
    //   app: 'bs://3ceeb401138a13ae150e312ad9a0be4640f113e2',
    //   logger,
    // })

    await driver.target.updateSettings({allowInvisibleElements: true})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot on buggy screen with collapsable view', async () => {
    await driver.target.updateSettings({allowInvisibleElements: true})
    await sleep(5000)
    const nextButton = await driver.element({type: 'id', selector: 'next_button'})
    await nextButton.click()
    await sleep(5000)
    const memberButton = await driver.element({type: 'id', selector: 'navigation_member'})
    await memberButton.click()
    await sleep(5000)

    await driver.init()

    await test({
      type: 'android',
      tag: 'app-fully-fr',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })

  it('take full app screenshot', async () => {
    await sleep(3000)
    const nextButton = await driver.element({type: 'id', selector: 'next_button'})
    await nextButton.click()
    await sleep(2000)
    let searchField = await driver.element({type: 'id', selector: 'search_view'})
    await searchField.click()
    await sleep(2000)
    searchField = await driver.element({type: 'id', selector: 'search_edit_text'})
    await searchField.type('red')
    await driver.target.pressKeyCode(66)
    await sleep(4000)
    const productView = await driver.elements({type: 'id', selector: 'product_imageView'})
    await productView[1].click()
    await sleep(5000)

    const okButton = await driver.element('android=new UiSelector().text("OK")')
    await okButton?.click()

    await driver.init()

    // await driver.mainContext.setScrollingElement({type: 'id', selector: 'content_list'})

    await test({
      type: 'android',
      tag: 'app-fully-fr2',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})

describe('screenshoter ios app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'ios',
      app: '/Users/kyrylo/Downloads/UNIQLO.app.zip',
      logger,
    })

    await driver.target.updateSettings({allowInvisibleElements: true})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot on pager screen', async () => {
    await sleep(5000)

    await test({
      type: 'ios',
      tag: 'app-fully-fr0',
      fully: true,
      framed: true,
      wait: 1500,
      overlap: {top: 0, bottom: 0},
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
