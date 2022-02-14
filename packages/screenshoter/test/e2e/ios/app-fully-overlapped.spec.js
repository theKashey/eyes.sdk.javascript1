const {makeDriver, sleep, test} = require('../e2e')

describe('screenshoter ios app', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full app screenshot on screen with overlapped status bar', async () => {
    const button = await driver.element({type: 'accessibility id', selector: 'Bottom to safe area'})
    await button.click()
    await sleep(3000)

    await driver.init()

    await test({
      type: 'ios',
      tag: 'app-fully-overlapped',
      fully: true,
      framed: true,
      scrollingMode: 'scroll',
      wait: 1500,
      overlap: {top: 200, bottom: 50},
      driver,
      logger,
    })
  })
})