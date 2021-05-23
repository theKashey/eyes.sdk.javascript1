const cwd = process.cwd()
const path = require('path')
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {setupEyes} = require('@applitools/test-utils')
const {BrowserType} = require(cwd)

describe('safari-earlyaccess', async () => {
  let driver, destroyDriver, eyes
  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    eyes = setupEyes({vg: true})
    let conf = eyes.getConfiguration()
    conf.setTestName('safari-earlyaccess')
    conf.setAppName(`SDK Coverage Tests`)
    conf.addBrowser(800, 600, BrowserType.SAFARI_EARLY_ACCESS)
    eyes.setConfiguration(conf)
    await eyes.open(driver)
  })
  afterEach(async () => {
    await destroyDriver()
    await eyes.abortIfNotClosed()
  })
  it('works', async () => {
    await spec.visit(
      driver,
      'https://applitools.github.io/demo/TestPages/FramesTestPage/index.html',
    )
    await eyes.check({})
    await eyes.close()
  })
})
