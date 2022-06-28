const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter androidx app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({
      type: 'android',
      app: 'https://applitools.jfrog.io/artifactory/Examples/app-debug.apk',
      logger,
    })
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full element screenshot', async () => {
    await driver.init()

    return test({
      type: 'android',
      tag: 'element-fully',
      region: {type: 'id', selector: 'com.applitoolstest:id/view_15'},
      fully: true,
      scrollingMode: 'scroll',
      wait: 1500,
      driver,
      logger,
    })
  })
})
