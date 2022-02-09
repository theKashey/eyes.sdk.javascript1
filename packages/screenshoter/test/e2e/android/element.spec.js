const {makeDriver, test} = require('../e2e')

describe('screenshoter android app', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'android', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take element screenshot', async () => {
    await test({
      type: 'android',
      tag: 'element',
      region: {type: 'id', selector: 'btn_recycler_view'},
      scrollingMode: 'scroll',
      driver,
      logger,
    })
  })
})
