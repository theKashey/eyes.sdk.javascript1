const {makeDriver, test} = require('../tests')

describe('screenshoter android app', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot', async () => {
    await test({
      type: 'android',
      tag: 'app',
      withStatusBar: true,
      wait: 1500,
      driver,
      logger,
    })
  })
})
