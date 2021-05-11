const {Eyes, Target} = require('../../dist')

describe('Nightwatch e2e tests', async () => {
  it('chaining api', function (driver) {
    driver
      .url('https://applitools.github.io/demo/TestPages/FramesTestPage/')
      .eyesOpen()
      .eyesCheck(Target.window().fully())
      .eyesClose()
      .end()
  })

  it('async api', async function (driver) {
    await driver.url('https://applitools.github.io/demo/TestPages/FramesTestPage/')

    const eyes = new Eyes()
    await eyes.open(driver, 'eyes-nightwatch', 'hello world', {width: 800, height: 600})
    await eyes.check(Target.window().fully())
    await eyes.close()
  })
})
