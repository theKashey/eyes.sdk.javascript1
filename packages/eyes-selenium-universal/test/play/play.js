// adopted styleSheets on chrome
const path = require('path')
const spec = require(path.resolve('./dist/spec-driver'))
const setupEyes = require('@applitools/test-utils/src/setup-eyes')
const {VisualGridRunner} = require('@applitools/eyes-api')

describe.skip('play', () => {
  let driver, destroyDriver, eyes, runner

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    runner = new VisualGridRunner({testConcurrency: 5})
    eyes = setupEyes({
      vg: true,
      browsersInfo: [{name: 'chrome', width: 640, height: 480}],
      driver: driver,
      runner,
    })
  })

  afterEach(async () => {
    try {
      await eyes.abort()
    } finally {
      await destroyDriver(driver)
    }
  })

  it('play', async () => {
    try {
      await spec.visit(driver, 'https://applitools.com/helloworld/')
      await eyes.open(driver, 'play', 'test', {width: 700, height: 460})
      await eyes.check({isFully: false, fully: false})
      await eyes.close(false)
      const summary = await runner.getAllTestResults(false)
      console.log(JSON.stringify(summary))
    } catch (ex) {
      console.log(ex)
    }
  })
})
