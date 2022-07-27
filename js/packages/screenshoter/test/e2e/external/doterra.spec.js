const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'android',
      app: '/Users/kyrylo/Downloads/app-qa-debug.apk',
      noReset: true,
      logger,
    })

    // ;[driver, destroyDriver] = await makeDriver({
    //   type: 'android-sauce',
    //   deviceName: 'Google Pixel 3 GoogleAPI Emulator',
    //   platformVersion: '11.0',
    //   logger,
    // })

    // ;[driver, destroyDriver] = await makeDriver({
    //   type: 'android-bs',
    //   deviceName: 'Google Pixel 3',
    //   platformVersion: '10.0',
    //   logger,
    // })

    await driver.target.updateSettings({allowInvisibleElements: true})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot', async () => {
    await sleep(30000)
    console.log('starting...')
    await driver.init()
    // const nextButton = await driver.element({type: 'id', selector: 'next_button'})
    // await nextButton.click()
    // await sleep(2000)
    // let searchField = await driver.element({type: 'id', selector: 'search_view'})
    // await searchField.click()
    // await sleep(2000)
    // searchField = await driver.element({type: 'id', selector: 'search_edit_text'})
    // await searchField.type('red')
    // await driver.target.pressKeyCode(66)
    // await sleep(4000)
    // const productView = await driver.elements({type: 'id', selector: 'product_imageView'})
    // await productView[1].click()
    // await sleep(5000)

    // const okButton = await driver.element('android=new UiSelector().text("OK")')
    // await okButton?.click()

    // await driver.init()

    // await driver.mainContext.setScrollingElement({type: 'id', selector: 'content_list'})

    await test({
      type: 'android',
      tag: 'app-fully-doterra',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
