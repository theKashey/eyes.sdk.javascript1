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
    await driver.element({type: '-ios predicate string', selector: "name = 'Singapore'"}).then(button => button.click())
    await driver.element({type: '-ios predicate string', selector: "name = 'Next'"}).then(button => button.click())
    await driver.target.touchAction([
      {action: 'press', x: 290, y: 356 - 47},
      {action: 'wait', ms: 500},
      {action: 'release'},
      // {action: 'press', x: 580, y: 1215},
      // {action: 'release'},
    ])
    // require('fs').writeFileSync('./layout.png', await driver.takeScreenshot())
    // return
    await driver.element({type: '-ios predicate string', selector: "name = 'Skip'"}).then(button => button.click())
    await driver
      .element({type: '-ios predicate string', selector: "value = 'Enter your email address'"})
      .then(field => field.type('tuser@mailinator.com'))
    await driver
      .element({type: '-ios predicate string', selector: "value = 'Enter your password'"})
      .then(field => field.type('AutoPw@1'))
    await driver.element({type: '-ios predicate string', selector: "name = 'Sign in'"}).then(button => button.click())
    await sleep(5000)

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
