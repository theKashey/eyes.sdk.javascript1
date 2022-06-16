const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', app: '/Users/kyrylo/Downloads/latest.apk', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot on screen with scroll view', async () => {
    // const button = await driver.element({type: 'id', selector: 'btn_scroll_view_footer_header'})
    // await button.click()
    await sleep(30000)

    await driver.target.updateSettings({allowInvisibleElements: true})

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
