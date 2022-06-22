const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter web', () => {
  let driver, destroyDriver

  beforeEach(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'chrome', logger})
    await driver.visit(
      'data:text/html,<body style="background:red;margin:0"><div style="background:white;position:absolute;left:50.5;top:12.80;width:942.98;height:3284.36;">blah</div></body>',
    )
    await driver.setViewportSize({width: 1200, height: 800})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full element with fractional coordinate screenshot with "css" scrolling', async () => {
    await test({
      type: 'web',
      tag: 'element-fully-fractional',
      region: 'div',
      fully: true,
      scrollingMode: 'css',
      driver,
      logger,
    })
  })
})
