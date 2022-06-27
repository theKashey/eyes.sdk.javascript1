const {makeDriver, test, sleep, logger} = require('../e2e')

// appium's set orientation will set non-deterministic landscape mode to either 90° or 270°
describe('screenshoter android app', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot on device with landscape orientation', async () => {
    // disable auto-rotation
    await driver.execute('mobile:shell', {command: 'settings put system accelerometer_rotation 0'})
    // set device rotation to 270°
    await driver.execute('mobile:shell', {command: 'settings put system user_rotation 3'})

    await driver.init()

    await test({
      type: 'android',
      tag: 'app-landscape',
      wait: 1500,
      driver,
      logger,
    })
  })

  it('take viewport screenshot', async () => {
    // disable auto-rotation
    await driver.execute('mobile:shell', {command: 'settings put system accelerometer_rotation 0'})
    // set device rotation to 90°
    await driver.execute('mobile:shell', {command: 'settings put system user_rotation 1'})

    await driver.init()

    await test({
      type: 'android',
      tag: 'app-landscape-secondary',
      wait: 1500,
      driver,
      logger,
    })
  })
})
