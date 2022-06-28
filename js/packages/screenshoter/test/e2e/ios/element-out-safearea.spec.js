const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter ios app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'ios',
      app: 'https://applitools.jfrog.io/artifactory/Examples/awesomeswift.zip',
      logger,
    })
  })

  after(async () => {
    await destroyDriver()
  })

  it('take element out of safearea screenshot', async () => {
    await test({
      type: 'ios',
      tag: 'element-out-safearea',
      region: {type: '-ios class chain', selector: '**/XCUIElementTypeNavigationBar'},
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
