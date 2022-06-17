const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'android-sauce',
      deviceName: 'Samsung Galaxy S20 WQHD GoogleAPI Emulator',
      platformVersion: '11.0',
      app: 'storage:filename=InstrumentedApk_#26906.apk',
      logger,
    })
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot on screen with scroll view', async () => {
    await driver.target.updateSettings({allowInvisibleElements: true})
    await sleep(10000)
    const nextButton = await driver.element({type: 'id', selector: 'next_button'})
    await nextButton.click()
    await sleep(5000)
    const memberButton = await driver.element({type: 'id', selector: 'navigation_member'})
    await memberButton.click()
    await sleep(10000)

    await driver.init()

    // await driver.mainContext.setScrollingElement({type: 'id', selector: 'content_list'})

    await test({
      type: 'android',
      tag: 'app-fully-scroll',
      fully: true,
      framed: true,
      wait: 1500,
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
